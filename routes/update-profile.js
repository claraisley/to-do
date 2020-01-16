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
      response.render('../views/update-profile', templateVars);
    }
  });

  //post update profile
  router.post('/update-profile', (request, response) => {
    const password = request.body.password;
    const newPassword = request.body["new-password"];
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);
    db.query(`SELECT email, password
  FROM users
  WHERE id = $1;`, [request.session.user_id])
      .then(data => {
        const user = data.rows[0];
        if (!bcrypt.compareSync(password, user.password)) {
          response.statusCode = 403;
          response.end('403 Forbidden. Wrong password');
        } else {
          db.query(`UPDATE users SET name = $1, password = $2 WHERE id = $3`,
            [request.body.name, hashedPassword, request.session.user_id])
            .then(() => {
              response.redirect('/tasks');
            });
        }
      });
  });
  return router;
};