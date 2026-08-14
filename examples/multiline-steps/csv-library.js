const Yadda = require('yadda');
const English = Yadda.localisation.English;
const Dictionary = Yadda.Dictionary;
const parse = require('csv-parse');
const _ = require('lodash');
const assert = require('assert');

module.exports = (function () {
  let csv;

  const dictionary = new Dictionary().define('csv', /([^\u0000]*)/, csvConverter).define('name', /(\w+)/, nameConverter);

  const library = English.localise(new Yadda.ContextBoundLibrary(dictionary))

    .given('a csv file\n$csv', function (_csv, next) {
      csv = _csv;
      next();
    })

    .then('$name is older than $name', function (user1, user2, next) {
      assert(user1.Age > user2.Age);
      next();
    });

  function csvConverter(text, cb) {
    parse(text, { auto_parse: true, columns: true }, function (err, doc, stats) {
      cb(err, doc);
    });
  }

  function nameConverter(name, cb) {
    cb(
      null,
      _.find(csv, function (row) {
        return row['First Name'] === name;
      })
    );
  }

  return library;
})();
