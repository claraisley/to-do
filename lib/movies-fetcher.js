const request = require('request-promise-native');

const fetchMovie = function(title) {
  //return request(`http://www.omdbapi.com/?t=${title}&apikey=bcc803ff`); //API for movies
  return request(`http://api.wolframalpha.com/v2/query?appid=7A6TV5-KUG69PLPEV&input=${title}&output=json`);
};


module.exports = fetchMovie;