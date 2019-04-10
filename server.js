const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;

const functions = require('./lib/functions');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

app.get('/', (request, response) => {
  response.send('Hello!');
});

app.get('/urls', (request, response) => {
  const templateVars = {
    username: request.cookies['username'],
    urls: urlDatabase
  };
  response.render('urls_index', templateVars);
});

app.post('/urls', (request, response) => {
  const randomString = functions.generateRandomString();
  urlDatabase[randomString] = request.body.longURL;
  console.log(urlDatabase);
  response.redirect(`/urls/${randomString}`);
});

app.get('/urls/new', (request, response) => {
  const templateVars = {
    username: request.cookies['username']
  };
  response.render('urls_new', templateVars);
});

app.get('/u/:id', (request, response) => {
  const longURL = urlDatabase[request.params.id];
  response.redirect(longURL);
});

app.get('/urls/:id', (request, response) => {
  const templateVars = {
    username: request.cookies['username'],
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

app.post('/login', (request, response) => {
  response.cookie('username', request.body.username);
  response.redirect('/urls');
});

app.post('/logout', (request, response) => {
  response.clearCookie('username');
  response.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});