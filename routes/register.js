const router = require("express").Router();
const bcrypt = require('bcrypt');



module.exports = (db) => {
  // load login/register page
  router.get('/', (request, response) => {
    // check if user is logged in
    if (request.session.user_id) {
      response.redirect('/tasks');

    } else {
      let templateVars = {
        user: { id: undefined, name: null }
      };
      response.render('../views/register', templateVars);
    }
  });

  //POST register
  router.post('/', (request, response) => {
    const email = request.body.email;
    const password = request.body.password;
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    if (email === '' || password === '') {
      response.statusCode = 400;
      response.end('400 Bad request. Missing email or password');
      return;
    }
    db.query(`SELECT email
    FROM users
    WHERE email = $1;`, [request.body.email])
      .then(data => {
        const user = data.rows[0];
        if (user) {
          response.statusCode = 400;
          response.end('400 Bad request. Email already registered');
        } else {
          db.query(`INSERT INTO users(name, email, password) VALUES($1,$2,$3) RETURNING *;`,
            [request.body.name, request.body.email, hashedPassword])
            .then(data => {
              const newUser = data.rows[0];
              // eslint-disable-next-line camelcase
              request.session.user_id = newUser.id;
              response.redirect('/tasks');
            });
        }
      });
  });
  return router;
};