"use strict";

var Language = require('./Language');

module.exports = (function() {

    var vocabulary = {
        feature: '(?:[Фф]ункция|[Фф]ункционал|[Сс]войство)',
        scenario: 'Сценарий',
        examples: 'Примеры?',
        pending: '(?:[Ww]ip|[Tt]odo)',
        only: 'Только',
        background: '(?:[Пп]редыстория|[Кк]онтекст)',
        given: '(?:[Дд]опустим|[Дд]ано|[Пп]усть|[Ии]|[Н]о)(?:\\s[Яя])?',
        when: '(?:[Ее]сли|[Кк]огда|[Ии]|[Н]о)(?:\\s[Яя])?',
        then: '(?:[Тт]о|[Тт]огда|[Ии]|[Н]о)(?:\\s[Яя])?',
        _steps: ['given', 'when', 'then']
    };

    return new Language('Russian', vocabulary);
})();
