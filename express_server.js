const express = require("express");
var cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.use(cookieParser())

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "njh87y": "http://www.exam.com"
};

function generateRandomString(outputLength) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < outputLength; i ++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  console.log("six digit code: ", result);
  return result;
}

app.get("/urls", (req, ren) => {
  console.log(req.cookies.username);
  let templateVars = {
     urls: urlDatabase,
     username: req.cookies["username"]
  };
  ren.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
 };
  res.render("urls_new",templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], /* What goes here? */ 
    username:req.cookies['username']};
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  let newShortUrl = generateRandomString(6); 
  res.redirect(`http://localhost:8080/urls/${newShortUrl}`);
  urlDatabase[newShortUrl] = 'http://' + req.body.longURL;
});

//delete an url
app.post("/urls/:shortURL/delete", (req, res) => {
  //console.log('delete: ', req.params.shortURL)
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});

// edit a tiny url from database ---->>>>>
app.post("/urls/:shortURL/edit", (req, res) => {
  let shortUrl = req.params.shortURL
  console.log('Edit: ', req.params.shortURL);
  res.redirect(`/urls/${shortUrl}`);
})

// update button on the tine url show page ----->>>>
app.post("/urls/:shortURL/update", (req, res) => {
  let longUrl = req.body.editURL
  urlDatabase[req.params.shortURL] = longUrl;
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/signIn", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect('/urls');
});

app.post("/urls/signout", (req, res) => {
  //const username = req.body.username;
  res.clearCookie('username');
  res.redirect('/urls');
});



