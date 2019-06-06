var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs")
var urlDatabase = {};
const users = {};

function generateRandomString() {
    return (Math.random() * 6).toString(36).substring(6);
}

function urlsForUser(id) {
    var newArray = [];
    for(url in urlDatabase) {
        let currentUser = urlDatabase[url];
        if(currentUser.userID === id){
            newArray.push(url);
        }
    }
    return newArray;
}

function emailChecker(email) {
    for(user in users) {
        let currentUser = users[user];
        if(currentUser.email === email){
            return user;
        }
    }
    return false;
}

app.get("/urls/new", (req, res) => {
    if(!req.cookies["user_id"]) {
        res.redirect("/login");
    } else {
        let templateVars = { user: users[req.cookies["user_id"]] };
        res.render("urls_new", templateVars);
    }
});

app.post("/urls/:shortURL/delete", (req, res) => {
    if(!urlDatabase[req.params.shortURL]) {
        res.status(404);
        res.send("Error 404");
    }
    else if(req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID) {
        delete urlDatabase[req.params.shortURL];
        res.redirect("/urls");
    } else {
        res.send("This does not belong to you.")
    }
});

app.get("/urls/:shortURL", (req, res) => {
    if(!urlDatabase[req.params.shortURL]) {
        res.status(404);
        res.send("Error 404");
    }
    else if(req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID) {
        let templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, urls: urlDatabase };
        res.render("urls_show", templateVars);
    } else {
        res.send("This does not belong to you.")
    }
});

app.post("/urls/:id", (req, res) => {
    urlDatabase[req.params.id].longURL = req.body.urls;
    res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/urls", (req, res) => {
    let templateVars = { user: users[req.cookies["user_id"]], urls: urlsForUser(req.cookies["user_id"]), objURLs: urlDatabase };
    res.render("urls_index", templateVars);
  });

app.post("/urls", (req, res) => {
    var randomString = generateRandomString();
    urlDatabase[randomString] = {};
    urlDatabase[randomString].longURL = req.body.longURL;
    urlDatabase[randomString].userID = req.cookies["user_id"];
    res.redirect("/urls/"+randomString);
});

app.get("/register", (req, res) => {
    let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
    res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
    var repeatedEmail = emailChecker(req.body.email);

    if(!(req.body.email && req.body.password) || repeatedEmail) {
        res.status(400);
        res.send("Invalid inputs.");
    } else {
        var randomId = generateRandomString();
        users[randomId] = {};
        users[randomId].id = randomId;
        users[randomId].email = req.body.email;
        users[randomId].password = req.body.password;
        res.cookie("user_id", randomId);
        res.redirect("/urls/");
    }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/users.json", (req, res) => {
    res.json(users);
});

app.get("/", (req, res) => {
    res.redirect("/urls");
});

app.get("/login", (req, res) => {
    let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
    res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
    var checkEmail = emailChecker(req.body.email);
    if(!checkEmail) {
        res.status(403).send("Wrong credentials");
    } else if (req.body.password === users[checkEmail].password) {
        res.cookie("user_id", checkEmail);
    }
    else {
        res.status(403).send("Wrong credentials");
    }
    res.redirect("/urls/");
});

app.post("/logout", (req, res) => {
    res.clearCookie('user_id')
    res.redirect("/urls");
});