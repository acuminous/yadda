const Yadda = require('yadda');
const English = Yadda.localisation.English;
const Dictionary = Yadda.Dictionary;
const babel = require('babel');

module.exports = (function () {
  let case_description;
  let es6_code;
  const cases = {};

  const dictionary = new Dictionary().define('CASE', /(\w+)/, unique).define('CODE', /([^\u0000]*)/);
  const library = English.localise(new Yadda.ContextBoundLibrary(dictionary))

    .given('I need to transpile $CASE', function (s, next) {
      case_description = s;
      next();
    })

    .when('EcmaScript6=$CODE', function (code, next) {
      es6_code = code;
      next();
    })

    .then('EcmaScript5=$CODE', function (expected_es5_code, next) {
      const result = babel.transform(es6_code, {
        filename: case_description,
        compact: false,
      });

      const actual_es5_code = result.code;

      if (expected_es5_code.trim() != actual_es5_code.trim()) throw new Error(['transpile fail on ' + case_description, 'expected:', expected_es5_code, 'actual', actual_es5_code].join('\n'));

      next();
    });

  function unique(key, next) {
    if (Object.keys(cases).indexOf(key) >= 0) return next(new Error('case: ' + key + ' is not unique'));
    cases[key] = key;
    next(null, key);
  }

  return library;
})();
