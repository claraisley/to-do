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
const { walkObject } = require('walk-object')

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


// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
// Note: mount other resources here, using the same pattern above

// Read categories IDs from database
// This creates an object like { film_and_tv_series: 1, book: 2, ...}
const categories = {};
db.query(`SELECT id, title FROM categories;`).then(data => {
  for (let row of data.rows) {
    categories[row.title] = row.id; //dentroo do banco de dados todas as linhas com o titulo isso vai ser igual ao id
  }
});

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (request, response) => {
  response.render("index");
});

app.get("/tasks", (request, response) => {
  db.query(`SELECT * FROM tasks WHERE category_id = 1 AND user_id = ID FROM SESSION`, [request.body.email])
  response.render("tasks");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
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

//POST register
app.post('/register', (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

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
          [request.body.name, request.body.email, hashedPassword])
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


const foodWords = ['restaurant', 'fast food', 'sandwich'];
const bookWords = ['Book', "book", "written by", 'author']
const movieWords = ['AcademyAward', 'Movie']


//POST to-do-list
app.post('/create-item', (request, response) => {
  const item = request.body.input;
  fetchItem(item).then(body => {
    let megaString = '';
    console.log(`${item} is the search item `)
    walkObject(JSON.parse(body).queryresult, ({ value }) => {
      if (typeof value === 'string') megaString += " " + value
    })

    if (body.error === "Item not found!") {
      console.log("not found");
      //books
    } else if (bookWords.some(substring => {

      if (megaString.includes(substring)) console.log(substring)
      return megaString.includes(substring)
    }

    )) {
      console.log(`found a book`);
      db.query(`INSERT INTO tasks(input, category_id, user_id) VALUES($1,$2,$3) RETURNING *;`,
        [request.body.input, categories['books'], request.session.user_id])
        .then(data => {
          const task = data.rows[0]; //delete after
          response.json(task);
        });
      //movies
    } else if (movieWords.some(substring => {
      if (megaString.includes(substring)) console.log(substring)
      return megaString.includes(substring)
    })) {
      console.log(`found a movie`);
      db.query(`INSERT INTO tasks(input, category_id, user_id) VALUES($1,$2,$3) RETURNING *;`,
        [request.body.input, categories['film_and_tv_series'], request.session.user_id])
        .then(data => {
          const task = data.rows[0]; //delete after
          response.json(task);
        });
      //restaurants
    } else if (foodWords.some(substring => megaString.includes(substring))) {
      console.log('found a restaurant');
      db.query(`INSERT INTO tasks(input, category_id, user_id) VALUES($1,$2,$3) RETURNING *;`,
        [request.body.input, categories['restaurants'], request.session.user_id])
        .then(data => {
          const task = data.rows[0]; //delete after
          response.json(task);
        });
      // items
    } else {
      console.log(`found a product`);
      db.query(`INSERT INTO tasks(input, category_id, user_id) VALUES($1,$2,$3) RETURNING
    *;`,
        [request.body.input, categories['products'], request.session.user_id])
        .then(data => {
          const task = data.rows[0]; //delete after
          response.json(task);
        });
    }
  });

  //Logout
  app.post('/logout', (request, response) => {
    // eslint-disable-next-line camelcase
    request.session.user_id = null;
    response.redirect('/to-do-list');
  });
})
//POST DELETE
//logica usada no outroo grupo, ter como referencia.
// app.post('/to-do-list/delete',(request, response) => {
//   const user_id = request.session.user_id;
//   const queryParams = [user_id, input];
//   const queryString = db.query(`DELETE FROM tasks
//   WHERE user_id = $1 AND input = $2
//   `);
//   const result = await db.query(queryString, queryParams);
//   response.redirect('/to-do-list');

// });


// Wednesday todo list

// 1. create the user specific task list- join on tasks, categories and users
//   populate user categories table by using
//      Movies  select * from tasks where category_id = 1 AND user_id = ID FROM SESSION
//      Books   select * from tasks where category_id = 2 AND user_id = ID FROM SESSION
//      Rests   select * from tasks where category_id = 3 AND user_id = ID FROM SESSION
//      Items   select * from tasks where category_id = 2 AND user_id = ID FROM SESSION

//    recategorize an item, if it was mis categorized in the first place
//    select ITEM from tasks where user_id FROM SESSION and update the category_id to the  //      new category_id
//
//

// 2. be able to update the user profile
// 3. refactor code and make other files that are imported in the server, for example ///////helper functions, and imports
//

//
