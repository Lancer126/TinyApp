var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
const users = {};

function generateRandomString() {
    return (Math.random() * 6).toString(36).substring(6);
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

app.set("view engine", "ejs")

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post("/urls", (req, res) => {
    var randomString = generateRandomString();
    urlDatabase[randomString] = req.body.longURL;
    res.redirect("/urls/"+randomString);
});

app.get("/urls/new", (req, res) => {
    let templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_new", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase };
    res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
    urlDatabase[req.params.id] = req.body.longURL;
    res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
    res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/urls", (req, res) => {
    let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
    res.render("urls_index", templateVars);
  });

app.get("/register", (req, res) => {
    let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
    res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
    var repeatedEmail = emailChecker(req.body.email);

    if(!(req.body.email && req.body.password) || repeatedEmail) {
        res.status(400);
        res.redirect("/urls/");
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