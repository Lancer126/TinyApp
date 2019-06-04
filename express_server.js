var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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
    let templateVars = { shortURL: randomString, longURL: urlDatabase };
    res.render("urls_show", templateVars)
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase };
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});