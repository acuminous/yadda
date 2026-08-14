const Yadda = require('yadda');
const Dictionary = Yadda.Dictionary;

module.exports = (function () {
  return new Dictionary().define('NUM', /(\d+)/);
})();
