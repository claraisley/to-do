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
      response.render('../views/login', templateVars);
    }
  });

  //POST login
  router.post('/login', (request, response) => {
    // check if user exists in database
    db.query(`SELECT id, email, password
  FROM users
  WHERE email = $1;`, [request.body.email])
      .then(data => {
        const user = data.rows[0];
        if (!user) {
          response.statusCode = 403;
          response.end('403 Forbidden. E-mail cannot be found');
        } else if (!bcrypt.compareSync(request.body.password, user.password)) {
          response.statusCode = 403;
          response.end('403 Forbidden. Wrong password');
        } else {
          // eslint-disable-next-line camelcase
          request.session.user_id = user.id;
          response.redirect('/tasks');
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

  return router;
};