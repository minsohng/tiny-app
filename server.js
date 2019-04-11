const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const PORT = 8080;

const urlDatabase = {};

const userDatabase = {};

module.exports = {
  userDatabase: userDatabase,
  urlDatabase: urlDatabase
};
const functions = require('./lib/functions');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['hello']
}));

app.set('view engine', 'ejs');

app.get('/', (request, response) => {
  response.send('Hello!');
});

app.get('/urls', (request, response) => {

  const userId = request.session.user_id;

  const urlDatabase = functions.urlsForUser(userId);

  const templateVars = {
    user: userDatabase[userId],
    urls: urlDatabase
  };
  response.render('urls_index', templateVars);
});

app.post('/urls', (request, response) => {
  if (!functions.isLoggedin(request.session.user_id)) {
    return response.redirect('/login');
  }
  const randomString = functions.generateRandomString();
  urlDatabase[randomString] = {
    longUrl: request.body.longURL,
    userId: request.session.user_id
  }
  response.redirect(`/urls/${randomString}`);
});

app.get('/urls/new', (request, response) => {

  if (!functions.isLoggedin(request.session.user_id)) {
    return response.send('You should log in first');
  }

  const templateVars = {
    user: userDatabase[request.cookies.user_id],
  };
  response.render('urls_new', templateVars);
});

app.get('/u/:id', (request, response) => {
  const longUrl = urlDatabase[request.params.id].longUrl;
  response.redirect(longUrl);
});

app.get('/urls/:id', (request, response) => {
  if (!functions.isLoggedin(request.session.user_id)) {
    return response.send('You should log in first');
  }
  const templateVars = {
    user: userDatabase[request.cookies.user_id],
    shortURL: request.params.id,
    longURL: urlDatabase[request.params.id].longUrl
  };
  response.render('urls_show', templateVars);
});

app.post('/urls/:id', (request, response) => {
  if (!functions.isLoggedin(request.session.user_id)) {
    return response.send('You should log in first');
  }
  const newUrl = request.body.longURL;
  urlDatabase[request.params.id].longUrl = newUrl;
  response.redirect('/urls');
});

app.post('/urls/:id/delete', (request, response) => {
  if (!functions.isLoggedin(request.session.user_id)) {
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

  if(!bcrypt.compareSync(password, userDatabase[functions.getUserId(email)].password)) {
    return response.status(403).send('Status Code 403: password is wrong');
  }

  request.session.user_id =  functions.getUserId(email);

  console.log(request.session)
  response.redirect('urls');
});

app.post('/logout', (request, response) => {
  if (!functions.isLoggedin(request.session.user_id)) {
    return response.send('You are not even logged in');
  }
  response.clearCookie('session');
  response.redirect('/urls');
});

app.get('/register', (request, response) => {
  response.render('urls_register');
});

app.post('/register', (request, response) => {

  const email = request.body.email;
  const password = request.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

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
    password: hashedPassword
  }
  userDatabase[userId] = newUser;
  request.session.user_id =  functions.getUserId(email);


  response.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



