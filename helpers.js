const users = require('./sample');
const urlDatabase = require('./sample');


const getUserByEmail = function(email, database) {
   
  for (let user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
  return null;
};

//To generate a random string
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

module.exports = { getUserByEmail, generateRandomString, urlsForUser };