const db = require('../server');

const generateRandomString = () => {
  let randomString = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randomString;
};


const checkEmailExists = (email) => {
  for (let userId in db.userDatabase) {
    if (db.userDatabase[userId].email === email) {
      return true;
    }
  }
  return false;
}

const getUserId = (email) => {
  for (let userId in db.userDatabase) {
    if (db.userDatabase[userId].email === email) {
      return db.userDatabase[userId].id;
    }
  }
  throw new Error('Cannot find id that matches email');
}

const isLoggedin = (cookie) => {

  if (!db.userDatabase[cookie]) {
    return false;
  }
  return true;
}

const urlsForUser = (userId) => {
  // check userId with urlDatabase[shortUrl].userId
  const urls = {};
  for (let key in db.urlDatabase) {
    if (db.urlDatabase[key].userId === userId) {
      urls[key] = db.urlDatabase[key].longUrl;
    }
  }
  return urls;
}


module.exports = {
  generateRandomString: generateRandomString,
  checkEmailExists: checkEmailExists,
  getUserId: getUserId,
  isLoggedin: isLoggedin,
  urlsForUser: urlsForUser
}