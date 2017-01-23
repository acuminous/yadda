"use strict";

var Language = require('./Language');

module.exports = (function() {

    var vocabulary = {
        feature: '(?:[Ff]uncionalidad|[Cc]aracterística)',
        scenario: '(?:[Ee]scenario|[Cc]aso)',
        examples: '(?:[Ee]jemplos|[Ee]jemplo)',
        pending: '[Pp]endiente',
        only: '[S]ólo',
        background: '[Ff]ondo',
        given: '(?:[Ss]ea|[Ss]ean|[Dd]ado|[Dd]ada|[Dd]ados|[Dd]adas)',
        when: '(?:[Cc]uando|[Ss]i|[Qq]ue)',
        then: '(?:[Ee]ntonces)',

        _steps: [
            'given', 'when', 'then',
            'sea', 'sean', 'dado', 'dada','dados', 'dadas',
            'cuando', 'si',
            'entonces'
        ],

        get sea() { return this.given; },
        get sean() { return this.given; },
        get dado() { return this.given; },
        get dada() { return this.given; },
        get dados() { return this.given; },
        get dadas() { return this.given; },
        get cuando() { return this.when; },
        get si() { return this.when; },
        get entonces() { return this.then; }
    };

    return new Language('Spanish', vocabulary);
})();
