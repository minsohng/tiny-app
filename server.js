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
  if (!functions.isLoggedin(request.session.user_id)) {
    response.redirect('/login');
  } else {
    response.redirect('urls');
  }
});

app.get('/urls', (request, response) => {

  if (!functions.isLoggedin(request.session.user_id)) {
    return response.render('error_page', {error: undefined});
  }

  const user_id = request.session.user_id;

  const urls = functions.urlsForUser(user_id);


  const templateVars = {
    user: userDatabase[request.session.user_id],
    urls: urls
  };

  response.render('urls_index', templateVars);
});

app.post('/urls', (request, response) => {
  if (!functions.isLoggedin(request.session.user_id)) {
    return response.render('error_page', {error: undefined});
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
    return response.redirect('/login');
  }

  const templateVars = {
    user: userDatabase[request.session.user_id],
  };
  response.render('urls_new', templateVars);
});

app.get('/u/:id', (request, response) => {
  if (!urlDatabase[request.params.id]) {
    return response.render('error_page', {error: 400});
  }
  const longUrl = urlDatabase[request.params.id].longUrl;
  response.redirect(longUrl);
});

app.get('/urls/:id', (request, response) => {
  if (!functions.isLoggedin(request.session.user_id)) {
    return response.render('error_page', {error: undefined});
  }

  if (!urlDatabase[request.params.id]) {
    return response.render('error_page', {error: 400});
  }
  const templateVars = {
    user: userDatabase[request.session.user_id],
    shortURL: request.params.id,
    longURL: urlDatabase[request.params.id].longUrl
  };
  response.render('urls_show', templateVars);
});

app.post('/urls/:id', (request, response) => {
  if (!functions.isLoggedin(request.session.user_id)) {
    return response.render('error_page', {error: undefined});
  }
  const newUrl = request.body.longURL;
  urlDatabase[request.params.id].longUrl = newUrl;
  response.redirect('/urls');
});

app.post('/urls/:id/delete', (request, response) => {
  if (!functions.isLoggedin(request.session.user_id)) {
    return response.render('error_page', {error: undefined});
  }
  delete urlDatabase[request.params.id];
  response.redirect('/urls');
});

app.get('/login', (request, response) => {
  if (functions.isLoggedin(request.session.user_id)) {
    return response.redirect('/urls');
  }
  const templateVars = {
    user: userDatabase[request.session.user_id]
  };
  response.render('urls_login', templateVars);
});

app.post('/login', (request, response) => {
  const email = request.body.email;
  const password = request.body.password;

  if (!email || !request.body.password) {
    return response.status(400).render('error_page', {error: 400, message: 'Your email or password is empty'});
  }

  if (!functions.checkEmailExists(email)) {
    return response.status(403).render('error_page', {error: 403, message: 'Your email does not exist'});
  }

  if(!bcrypt.compareSync(password, userDatabase[functions.getUserId(email)].password)) {
    return response.status(403).render('error_page', {error: 403, message: 'Your password does not match'});
  }

  request.session.user_id =  functions.getUserId(email);

  response.redirect('urls');
});

app.post('/logout', (request, response) => {
  if (!functions.isLoggedin(request.session.user_id)) {
    return response.render('error_page', {error: undefined});
  }
  response.clearCookie('session');
  response.redirect('/urls');
});

app.get('/register', (request, response) => {
  if (functions.isLoggedin(request.session.user_id)) {
    return response.redirect('/urls');
  }
  response.render('urls_register');
});

app.post('/register', (request, response) => {

  const email = request.body.email;
  const password = request.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !request.body.password) {
    return response.status(400).render('error_page', {error: 400, message: 'Your email or password is empty'});

  }

  if (functions.checkEmailExists(email)) {
    return response.status(400).render('error_page', {error: 400, message: 'Your email does not exist'});
  }

  const user_id = functions.generateRandomString();
  const newUser = {
    id: user_id,
    email: email,
    password: hashedPassword
  }
  userDatabase[user_id] = newUser;
  request.session.user_id =  functions.getUserId(email);
  response.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



