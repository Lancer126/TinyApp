var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");    //Allows for cookies
app.use(bodyParser.urlencoded({extended: true}));   //
app.use(cookieSession({ //Allows for cookies
    name: 'session',
    keys: ['key1', 'key2'],
  
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }));
app.set("view engine", "ejs")
const bcrypt = require('bcrypt');
var urlDatabase = {};
const users = {};
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });

function generateRandomString() {
    return (Math.random() * 6).toString(36).substring(6);
}

//Returns an array containing the links for a user
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

//Returns the user ID if email is already registered
function emailChecker(email) {
    for(user in users) {
        let currentUser = users[user];
        if(currentUser.email === email){
            return user;
        }
    }
    return false;
}

function encryptPassword(pwd) {
    return bcrypt.hashSync(pwd, 10);
}

//Create a new URL
app.get("/urls/new", (req, res) => {
    if(!req.session.user_id) {
        res.redirect("/login");
    } else {
        let templateVars = { user: users[req.session.user_id] };
        res.render("urls_new", templateVars);
    }
});

//Delete an existing URL
app.post("/urls/:shortURL/delete", (req, res) => {
    if(!urlDatabase[req.params.shortURL]) {
        res.status(404);
        res.send("Error 404");
    }
    else if(req.session.user_id === urlDatabase[req.params.shortURL].userID) {
        delete urlDatabase[req.params.shortURL];
        res.redirect("/urls");
    } else {
        res.send("This does not belong to you.")
    }
});

//If right user, shows a specific URL and its details
app.get("/urls/:shortURL", (req, res) => {
    if(!urlDatabase[req.params.shortURL]) {
        res.status(404);
        res.send("Error 404");
    }
    else if(req.session.user_id === urlDatabase[req.params.shortURL].userID) {
        let templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, urls: urlDatabase };
        res.render("urls_show", templateVars);
    } else {
        res.send("This does not belong to you.")
    }
});

//Sets longURL value in the database
app.post("/urls/:id", (req, res) => {
    urlDatabase[req.params.id].longURL = req.body.urls;
    res.redirect("/urls");
});

//Redirects to the website (longURL) directly
app.get("/u/:shortURL", (req, res) => {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
});

//Shows all the URLs for a specific user
app.get("/urls", (req, res) => {
    let templateVars = { user: users[req.session.user_id], urls: urlsForUser(req.session.user_id), objURLs: urlDatabase };
    res.render("urls_index", templateVars);
  });

//Creates a new TinyURL
app.post("/urls", (req, res) => {
    var randomString = generateRandomString();
    urlDatabase[randomString] = {};
    urlDatabase[randomString].longURL = req.body.longURL;
    urlDatabase[randomString].userID = req.session.user_id;
    res.redirect("/urls/"+randomString);
});

//Shows the register page
app.get("/register", (req, res) => {
    let templateVars = { user: users[req.session.user_id], urls: urlDatabase };
    res.render("urls_register", templateVars);
});

//Creates new users if email not already in use
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
        users[randomId].password = encryptPassword(req.body.password);
        req.session.user_id = randomId;
        res.redirect("/urls/");
    }
});

//If logged in, shows URLs for the user
app.get("/", (req, res) => {
    if(req.session.user_id) {
        res.redirect("/urls");
    } else {
        res.redirect("/login");
    }
});

//Shows login page
app.get("/login", (req, res) => {
    let templateVars = { user: users[req.session.user_id], urls: urlDatabase };
    res.render("urls_login", templateVars);
});

//Logs users in
app.post("/login", (req, res) => {
    var checkEmail = emailChecker(req.body.email);
    if(!checkEmail) {
        res.status(403).send("Wrong credentials");
    } else if (bcrypt.compareSync(req.body.password, users[checkEmail].password)) {
        req.session.user_id = checkEmail;
    }
    else {
        res.status(403).send("Wrong credentials");
    }
    res.redirect("/urls/");
});

//Logs users out and redirects to URLs page
app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/urls");
});