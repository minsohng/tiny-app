const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const userDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
module.exports = userDatabase;
const functions = require('./lib/functions');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

app.get('/', (request, response) => {
  response.send('Hello!');
});

app.get('/urls', (request, response) => {
  const templateVars = {
    user: userDatabase[request.cookies['user_id']],
    urls: urlDatabase
  };
  response.render('urls_index', templateVars);
});

app.post('/urls', (request, response) => {
  const randomString = functions.generateRandomString();
  urlDatabase[randomString] = request.body.longURL;
  response.redirect(`/urls/${randomString}`);
});

app.get('/urls/new', (request, response) => {

  if (!functions.isLoggedin(request.cookies['user_id'])) {
    return response.redirect('/login');
  }

  const templateVars = {
    user: userDatabase[request.cookies['user_id']],
  };
  response.render('urls_new', templateVars);
});

app.get('/u/:id', (request, response) => {
  const longURL = urlDatabase[request.params.id];
  response.redirect(longURL);
});

app.get('/urls/:id', (request, response) => {
  const templateVars = {
    user: userDatabase[request.cookies['user_id']],
    shortURL: request.params.id,
    longURL: urlDatabase[request.params.id]
  };
  response.render('urls_show', templateVars);
});

app.post('/urls/:id', (request, response) => {
  const newUrl = request.body.longURL;
  urlDatabase[request.params.id] = newUrl;
  response.redirect('/urls');
});

app.post('/urls/:id/delete', (request, response) => {
  delete urlDatabase[request.params.id];
  response.redirect('/urls');
});

app.get('/login', (request, response) => {
  const templateVars = {
    user: userDatabase[request.cookies['user_id']]
  };
  response.render('urls_login', templateVars);
});

app.post('/login', (request, response) => {
  const email = request.body.email;
  const password = request.body.password;

  if (!email || !request.body.password) {
    return response.status(400).send('Status Code 400: empty email or password');
  }

  if (!functions.checkEmailExists(email)) {
    return response.status(403).send('Status Code 403: email cannot be found');
  }

  if (!functions.checkPasswordMatch(password, email)) {
    return response.status(403).send('Status Code 403: password is wrong');
  }

  response.cookie('user_id', functions.getUserId(email));
  response.redirect('urls');
});

app.post('/logout', (request, response) => {
  response.clearCookie('user_id');
  response.redirect('/urls');
});

app.get('/register', (request, response) => {
  response.render('urls_register');
});

app.post('/register', (request, response) => {

  const email = request.body.email;

  if (!email || !request.body.password) {
    return response.status(400).send('Status Code 400: empty email or password');

  }

  if (functions.checkEmailExists(email)) {
    return response.status(400).send('Status Code 400: email exists in database');
  }

  const userId = functions.generateRandomString();
  const newUser = {
    id: userId,
    email: email,
    password: request.body.password
  }
  userDatabase[userId] = newUser;
  response.cookie('user_id', userId);

  response.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



