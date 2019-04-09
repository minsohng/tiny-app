const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

const functions = require('./lib/functions')

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

app.get('/', (request, response) => {
  response.send('Hello!');
});

app.get('/urls', (request, response) => {
  const templateVars = { urls: urlDatabase };
  response.render('urls_index', templateVars);
});

app.post('/urls', (request, response) => {
  const randomString = functions.generateRandomString();
  urlDatabase[randomString] = request.body.longURL;
  console.log(urlDatabase);
  response.redirect(`/urls/${randomString}`);
});

app.get('/urls/new', (request, response) => {
  response.render('urls_new');
});

app.get('/u/:shortURL', (request, response) => {
  const longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

app.get('/urls/:shortURL', (request, response) => {
  const templateVars = {
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL]
  };
  response.render('urls_show', templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});