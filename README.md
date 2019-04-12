# Tiny App

## Problem Statement

A full stack web app built with Node and Express that allows users to shorten long URLs (like bit.ly).

## How to run app

1. run `npm install`

2. run `node server.js`


## stretch

1. GET /urls
  - the date the short URL was created
  - the number of times the short URL was visited
  - the number number of unique visits for the short URL
  - if user is not logged in:
returns HTML with a relevant error message

2. GET /urls/new
  - if user is not logged in:
redirects to the /login page

3. GET /urls/:id
  - the date the short URL was created
  - the number of times the short URL was visited
  - the number of unique visits for the short URL
  - if a short URL for the given ID does not exist:
(Minor) returns HTML with a relevant error message
  - if user is not logged in:
returns HTML with a relevant error message
  - if user is logged it but does not own the URL with the given ID:
returns HTML with a relevant error message

4. GET /u/:id
  - if short URL for the given ID does not exist:
(Minor) returns HTML with a relevant error message

5. POST /urls
  - if user is not logged in:
(Minor) returns HTML with a relevant error message

6. POST /urls/:id
   - error message

7. POST /urls/:id/delete
  - error message

8. GET /login
  - if user is logged in:
(Minor) redirects to /urls

9. GET /register
  - if user is logged in:
(Minor) redirects to /urls