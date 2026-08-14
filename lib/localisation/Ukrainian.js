/**
 * Author: Oleksii Kuznietsov
 * https://github.com/Bloodhound1982
 */
var Language = require('./Language');

module.exports = (() => {
  var vocabulary = {
    feature: '(?:[Фф]ункція|[Фф]ункціонал|[Пп]отреба|[Аа]спект|[Оо]собливість|[Вв]ластивість)',
    rule: '[Пп]равило',
    scenario: '(?:[Сс]ценарій|[Шш]аблон)',
    examples: '[Пп]риклади',
    pending: '(?:[Нн]еперевірений|[Чч]екаючий|[Pp]ending|[Tt]odo)',
    only: '[Тт]ільки',
    background: '[Кк]онтекст',
    given: '(?:[Дд]ано|[Пп]ри|[Нн]ехай|[Іі]|[Тт]а|[Аа]ле)',
    when: '(?:[Яя]кщо|[Дд]е|[Кк]оли|[Іі]|[Тт]а|[Аа]ле)',
    then: '(?:[Тт]оді|[Іі]|[Тт]а|[Аа]ле)',
    _steps: ['given', 'when', 'then'],
  };

  return new Language('Ukrainian', vocabulary);
})();
