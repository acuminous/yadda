/* jslint node: true */
"use strict";

var Language = require('./Language');

module.exports = (function() {

    var vocabulary = {
        feature: '(?:[Ww]łaściwość|[Ff]unkcja|[Aa]spekt|[Pp]otrzeba [Bb]iznesowa)',
        scenario: '(?:[Ss]cenariusz|[Ss]zablon [Ss]cenariusza)',
        examples: '[Pp]rzykłady',
        pending: '(?:[Oo]czekujący|[Nn]iezweryfikowany|[Tt]odo)',
        only: '[Tt]ylko',
        background: '[Zz]ałożenia',
        given: '(?:[Zz]akładając|[Mm]ając|[Oo]raz|[Ii]|[Aa]le)',
        when: '(?:[Jj]eżeli|[Jj]eśli|[Gg]dy|[Kk]iedy|[Oo]raz|[Ii]|[Aa]le)',
        then: '(?:[Ww]tedy|[Oo]raz|[Ii]|[Aa]le)',
        _steps: [
            'given', 'when', 'then',
            'zakladajac', 'majac',
            'jezeli', 'jesli', 'gdy', 'kiedy',
            'wtedy'
        ],
        // Also aliasing Polish verbs for given-when-then for signature-lookup
        get zakladajac() { return this.given; },
        get majac() { return this.given; },
        get jezeli() { return this.when; },
        get jesli() { return this.when; },
        get gdy() { return this.when; },
        get kiedy() { return this.when; },
        get wtedy() { return this.then; }
    };

    return new Language('Polish', vocabulary);
})();
