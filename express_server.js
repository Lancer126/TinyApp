var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString() {
    return (Math.random() * 6).toString(36).substring(6);
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
    let templateVars = { username: req.cookies["username"] };
    res.render("urls_new", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase };
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
    let templateVars = { username: req.cookies["username"], urls: urlDatabase };
    res.render("urls_index", templateVars);
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/", (req, res) => {
    res.redirect("/urls");
});

app.post("/login", (req, res) => {
    res.cookie("username", req.body.username);
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    res.clearCookie('username')
    res.redirect("/urls");
});