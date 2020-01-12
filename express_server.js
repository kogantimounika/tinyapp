const express = require("express");
let cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');
const bodyParser = require("body-parser");
const users = require('./sample');
const urlDatabase = require('./sample');

app.use(cookieSession({
  name : 'session',
  keys : ["abcdhfg"]
}));

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  if (!user) {
    res.send("please login in urls ");
  }

  if (req.session.user_id) {
    const user_id = req.session.user_id;
    const outputDatabase = urlsForUser(user_id);
    let templateVars = {
      urls: outputDatabase,
      userObj: users[req.session["user_id"]]
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  let templateVars = {
    urls: urlDatabase,
    userObj: users[req.session["user_id"]]
  };
  if (user) {
    return res.render("urls_new",templateVars);
  } else {
    res.send("please login in urls new");
    return res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    res.send("please login first");
  }
  if (userId === urlDatabase[req.params.shortURL].userID) {
    let templateVars = { shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      userObj:users[req.session['user_id']]};
    res.render("urls_show", templateVars);
  } else if (userId !== urlDatabase[req.params.shortURL].userID) {
    res.send("This url does not belong to you");
  } else if (!userId) {
    res.send("Please login first");
  }
});



app.get("/register", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    userObj: users[req.session["user_id"]]
  };
  res.render("urls_register",templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    userObj: users[req.session["user_id"]]
  };
  res.render("urls_login",templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let newShortUrl = generateRandomString(6);
  urlDatabase[newShortUrl] = {
    longURL : req.body.longURL,
    userID : req.session["user_id"]};
  res.redirect("/urls");
});

//delete an url
app.post("/urls/:shortURL/delete", (req, res) => {
  let user = urlsForUser(req.session["user_id"]);
  if (user) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//edit a tiny url from database ---->>>>>
app.post("/urls/:shortURL/edit", (req, res) => {
  let user = urlsForUser(req.session["user_id"]);
  if (user) {
    let shortUrl = req.params.shortURL;
    res.redirect(`/urls/${shortUrl}`);
  } else {
    res.send("Error");
  }
});

// update button on the tine url show page ----->>>>
app.post("/urls/:shortURL/update", (req, res) => {
  let longUrl = req.body.editURL;
  urlDatabase[req.params.shortURL].longURL = longUrl;
  res.redirect('/urls');
});

//logout from the page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//register a user
app.post("/register", (req, res) => {
  const email = req.body.email;
  let pass = req.body.password;
  const password = bcrypt.hashSync(pass, 10);
  const id = generateRandomString(6);
  const findemail = getUserByEmail(email, users);
  if (email !== '' && password !== '' && !findemail) {
    let userObj = {id : id, email : email, password : password};
    users[id] = userObj;
    req.session.user_id = id;
    res.redirect('/urls');
  } else {
    res.send("Error: user already registered");
  }
});

//login a user
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let id = getUserByEmail(email, users);
  if (!id) {
    res.send("Please Register first to Login");
  } else if ((users[id].email === email) && (bcrypt.compareSync(password, users[id].password))) {
    req.session.user_id = id;
    res.redirect('/urls');
  } else {
    res.send("status code 403");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


