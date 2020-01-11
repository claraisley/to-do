// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const app        = express();
const morgan     = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
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
app.use("/api/widgets", widgetsRoutes(db));
// Note: mount other resources here, using the same pattern above


// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (req, res) => {
  res.render("index");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// TODO: Delete before committing
// Show login page
app.get('/index', (req, res) => {
  res.render('login'); //mudar para index depois
});

// handle login request
app.post('/login',(req, res) => {
  // get data from form
  // res.json({ email: req.body.email, password: req.body.password });

  // check if user exists in database
  db.query(`SELECT email, password
  FROM users
  WHERE email = $1;`,[req.body.email])
    .then(data => {
      const user = data.rows[0];
      if (!user) {
        res.statusCode = 403;
        res.end("403 Forbidden. E-mail cannot be found");
      } else if (!bcrypt.compareSync(req.body.password, user.password)) {
        res.statusCode = 403;
        res.end("403 Forbidden. Wrong password");
      } else {
        res.redirect('/to-do-list');
      }
      // if user, Check password
      // if valid, redirect to home
      // if invalid, render login page and show error
      res.json({ users });
    })
    .catch(err => {
      // render login with error
      res
        .status(500)
        .json({ error: err.message });
    });
});


// Get all users from database and return as json
app.get("/users", (req, res) => {

});