const userDatabase = require('../server');

const generateRandomString = () => {
  let randomString = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randomString;
};


const checkEmailExists = (email) => {
  for (let userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      return true;
    }
  }
  return false;
}

const checkPasswordMatch = (password, email) => {
  for (let userId in userDatabase) {
    if (checkEmailExists(email)) {
      if (userDatabase[userId].password === password){
        return true;
      }
    }
  }
  return false;
}

const getUserId = (email) => {
  for (let userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      return userDatabase[userId].id;
    }
  }
  throw new Error('Cannot find id that matches email');
}



module.exports = {
  generateRandomString: generateRandomString,
  checkEmailExists: checkEmailExists,
  checkPasswordMatch: checkPasswordMatch,
  getUserId: getUserId
}