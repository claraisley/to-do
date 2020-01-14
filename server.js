// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT = process.env.PORT || 8080;
const ENV = process.env.ENV || "development";
const express = require("express");
const bodyParser = require("body-parser");
const sass = require("node-sass-middleware");
const app = express();
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const fetchItem = require('./lib/fetch-item.js');
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
const widgetsRoutes = require("./routes/widgets");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));

// Note: mount other resources here, using the same pattern above


// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (request, response) => {
  response.render("index");
});

app.get("/tasks", (req, res) => {
  res.render("tasks");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

//GET login deleter depois
app.get('/login', (request, response) => {
  response.render('login'); //mudar para index depois
});

//POST login
app.post('/login', (request, response) => {
  // check if user exists in database
  db.query(`SELECT email, password
  FROM users
  WHERE email = $1;`, [request.body.email])
    .then(data => {
      const user = data.rows[0];
      if (!user) {
        response.statusCode = 403;
        response.end("403 Forbidden. E-mail cannot be found");
      } else if (!bcrypt.compareSync(request.body.password, user.password)) {
        response.statusCode = 403;
        response.end("403 Forbidden. Wrong password");
      } else {
        // eslint-disable-next-line camelcase
        request.session.user_id = user.id;
        response.redirect('/to-do-list');
      }
      response.json({ user });
    })
    .catch(err => {
      // render login with error
      response
        .status(500)
        .json({ error: err.message });
    });
});

//GET register DELETAR depois
app.get('/register', (request, response) => {
  response.render('register'); //mudar para index depois
});

//POST register
app.post('/register', (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email === "" || password === "") {
    response.statusCode = 400;
    response.end("400 Bad request. Missing email or password");
    return;
  }
  db.query(`SELECT email
  FROM users
  WHERE email = $1;`, [request.body.email])
    .then(data => {
      const user = data.rows[0];
      if (user) {
        response.statusCode = 400;
        response.end("400 Bad request. Email already registered");
      } else {
        db.query(`INSERT INTO users(name, email, password) VALUES($1,$2,$3) RETURNING *;`,
          [request.body.email, hashedPassword])
          .then(data => {
            const newUser = data.rows[0];

            // eslint-disable-next-line camelcase
            request.session.user_id = newUser.id;
            response.redirect('/to-do-list');
          });
      }
    });
});
//GET to-do-list
app.get('/to-do-list', (request, response) => {
  response.render('to-do-list');
});

//POST to-do-list
app.post('/create-item', (request, response) => {
  const item = request.body.item;
  fetchItem(item).then(body => {
    if (body.error === "Item not found!") {
      // Not a movie. Now search for Book or something else.


      // Only for testing
      response.statusCode = 400;
      response.end("400 Bad request. This item not exist");

    } else {
      response.send(body); //just for test
      let dataType = JSON.parse(body).queryresult.datatypes;
      if (dataType === 'Movie') {
        console.log("movie here");
        //send the results to the movie list;
      } else if (dataType === 'Book') {
        console.log("book here");
        //send the results to the movie list;
      } else {
        const assumptions = JSON.parse(body).queryresult.assumptions.values[1].desc;
        // console.log(assumptions.values[1].desc);
        // for (let item of assumptions) {
        if (assumptions.includes('restant' || 'food')) {
          console.log('found restaurant');
        } else {
          console.log('not found the restaurant');
        }


        //send the results to the movie list;
        // There is a movie with the given name
        // Save item to the database and assign it to the item category
        //to do insert into the database.
      }
    }
  });
});

