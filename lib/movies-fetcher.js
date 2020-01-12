const request = require('request-promise-native');

const fetchMovie = function(title) {
  return request(`http://www.omdbapi.com/?t=${title}&apikey=bcc803ff`);
};

module.exports = fetchMovie;