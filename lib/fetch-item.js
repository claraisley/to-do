const request = require('request-promise-native');

const fetchItem = function(title) {
  return request(`http://api.wolframalpha.com/v2/query?appid=7A6TV5-KUG69PLPEV&input=${title}&output=json`);
};


module.exports = {fetchItem};