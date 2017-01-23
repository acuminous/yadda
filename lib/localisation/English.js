"use strict";

var Language = require('./Language');

module.exports = (function() {

    var vocabulary = {
        feature: '[Ff]eature',
        scenario: '(?:[Ss]cenario|[Ss]cenario [Oo]utline)',
        examples: '(?:[Ee]xamples|[Ww]here)',
        pending: '(?:[Pp]ending|[Tt]odo)',
        only: '(?:[Oo]nly)',
        background: '[Bb]ackground',
        given: '(?:[Gg]iven|[Ww]ith|[Aa]nd|[Bb]ut|[Ee]xcept)',
        when: '(?:[Ww]hen|[Ii]f|[Aa]nd|[Bb]ut)',
        then: '(?:[Tt]hen|[Ee]xpect|[Aa]nd|[Bb]ut)',
        _steps: ['given', 'when', 'then']
    };

    return new Language('English', vocabulary);
})();
