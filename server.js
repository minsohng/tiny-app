const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;

const urlDatabase = {
  b6UTxQ: { longUrl: 'http://www.lighthouselabs.ca', userId: 'aJ48lW' },
  i3BoGr: { longUrl: 'https://www.google.ca', userId: 'aJ48lW' },
  bacaa: { longUrl: 'https://www.google.ca', userId: 'abcabc' }
};

const userDatabase = {
  aJ48lW: {
    id: 'aJ48lW',
    email: 'user@example.com',
    password: '123'
  },
  abcabc: {
    id: 'abcabc',
    email: 'user1@example.com',
    password: '123'
  }
};

module.exports = {
  userDatabase: userDatabase,
  urlDatabase: urlDatabase
};
const functions = require('./lib/functions');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

console.log(urlDatabase);

app.get('/', (request, response) => {
  response.send('Hello!');
});

app.get('/urls', (request, response) => {

  const userId = request.cookies.user_id;

  const urlDatabase = functions.urlsForUser(userId);
  console.log(urlDatabase)

  const templateVars = {
    user: userDatabase[userId],
    urls: urlDatabase
  };
  response.render('urls_index', templateVars);
});

app.post('/urls', (request, response) => {
  if (!functions.isLoggedin(request.cookies.user_id)) {
    return response.redirect('/login');
  }
  const randomString = functions.generateRandomString();
  urlDatabase[randomString] = {
    longUrl: request.body.longURL,
    userId: request.cookies.user_id
  }
  response.redirect(`/urls/${randomString}`);
});

app.get('/urls/new', (request, response) => {

  if (!functions.isLoggedin(request.cookies.user_id)) {
    return response.send('You should log in first');
  }

  const templateVars = {
    user: userDatabase[request.cookies['user_id']],
  };
  response.render('urls_new', templateVars);
});

app.get('/u/:id', (request, response) => {
  const longUrl = urlDatabase[request.params.id].longUrl;
  response.redirect(longUrl);
});

app.get('/urls/:id', (request, response) => {
  if (!functions.isLoggedin(request.cookies.user_id)) {
    return response.send('You should log in first');
  }
  const templateVars = {
    user: userDatabase[request.cookies.userId],
    shortURL: request.params.id,
    longURL: urlDatabase[request.params.id].longUrl
  };
  response.render('urls_show', templateVars);
});

app.post('/urls/:id', (request, response) => {
  if (!functions.isLoggedin(request.cookies.user_id)) {
    return response.send('You should log in first');
  }
  const newUrl = request.body.longURL;
  urlDatabase[request.params.id].longUrl = newUrl;
  response.redirect('/urls');
});

app.post('/urls/:id/delete', (request, response) => {
  if (!functions.isLoggedin(request.cookies.user_id)) {
    return response.send('You should log in first');
  }
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
  if (!functions.isLoggedin(request.cookies.user_id)) {
    return response.send('You are not even logged in');
  }
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



