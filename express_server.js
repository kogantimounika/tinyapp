const express = require("express");
let cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const {getUserByEmail} = require('./helpers');
const bodyParser = require("body-parser");
app.use(cookieSession({
  name : 'session',
  keys : ["abcdhfg"]
}));

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

let urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "z@z",
    password: "z"
  },
};

const generateRandomString = function(outputLength) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < outputLength; i ++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const urlsForUser = function(id) {
  let newData = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      newData[shortURL] = urlDatabase[shortURL];
    }
  }
  return newData;
};

app.get("/urls", (req, res) => {
  const user_id = req.session["user_id"];
  const outputDatabase = urlsForUser(user_id);
  let templateVars = {
    urls: outputDatabase,
    userObj: users[req.session["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/login");
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
    userObj: users[req.session["user_id"]]
  };
  if (typeof templateVars.userObj !== undefined) {
    res.render("urls_new",templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userObj:users[req.session['user_id']]};
  res.render("urls_show", templateVars);
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

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

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

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password1 = req.body.password;
  let id = getUserByEmail(email, users);
  if (!id) {
    res.send("Please Register first to Login");
  } else if ((users[id].email === email) && (bcrypt.compareSync(password1, users[id].password))) {
    req.session.user_id = id;
    res.redirect('/urls');
  } else {
    res.send("status code 403");
  }
});


