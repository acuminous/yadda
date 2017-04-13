/**
 * Author: Oleksii Kuznietsov
 * https://github.com/Bloodhound1982
 */
/* jslint node: true */
"use strict";

var Language = require('./Language');

module.exports = (function() {

    var vocabulary = {
        feature: '(?:[Фф]ункція|[Фф]ункціонал|[Пп]отреба|[Аа]спект|[Оо]собливість|[Вв]ластивість)',
        scenario: '(?:[Сс]ценарій|[Шш]аблон)',
        examples: '[Пп]риклади',
        pending: '(?:[Нн]еперевірений|[Чч]екаючий|[Pp]ending|[Tt]odo)',
        only: '[Тт]ільки',
        background: '[Кк]онтекст',
        given: '(?:[Дд]ано|[Пп]ри|[Нн]ехай|[Іі]|[Тт]а|[Аа]ле)',
        when: '(?:[Яя]кщо|[Дд]е|[Кк]оли|[Іі]|[Тт]а|[Аа]ле)',
        then: '(?:[Тт]оді|[Іі]|[Тт]а|[Аа]ле)',
        _steps: ['given', 'when', 'then']
    };

    return new Language('Ukrainian', vocabulary);
})();
