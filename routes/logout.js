const router = require("express").Router();
const bcrypt = require('bcrypt');



module.exports = () => {
  // load login/register page
  router.get('/', (request, response) => {
    // check if user is logged in
    if (request.session.user_id) {
      response.redirect('/tasks');

    } else {
      let templateVars = {
        user: { id: undefined, name: null }
      };
      response.render('../views/logout', templateVars);
    }
  });

  //POST Logout
  router.post('/logout', (request, response) => {
    // eslint-disable-next-line camelcase
    request.session.user_id = null;
    response.redirect('/');
  });

  return router;
};