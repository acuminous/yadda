"use strict";

var Language = require('./Language');

module.exports = (function () {

    var vocabulary = {
        feature: '(?:[Ff]uncionalidade|[Cc]aracter[íi]stica)',
        scenario: '(?:[Cc]en[aá]rio|[Cc]aso)',
        examples: '(?:[Ee]xemplos|[Ee]xemplo)',
        pending: '[Pp]endente',
        only: '[S][óo]',
        background: '[Ff]undo',
        given: '(?:[Ss]eja|[Ss]ejam|[Dd]ado|[Dd]ada|[Dd]ados|[Dd]adas|[Ee]|[Mm]as)',
        when: '(?:[Qq]uando|[Ss]e|[Qq]ue|[Ee]|[Mm]as)',
        then: '(?:[Ee]nt[aã]o|[Ee]|[Mm]as)',

        _steps: [
            'given', 'when', 'then',
            'seja', 'sejam', 'dado', 'dada', 'dados', 'dadas',
            'quando', 'se',
            'entao'
        ],

        get seja() { return this.given; },
        get sejam() { return this.given; },
        get dado() { return this.given; },
        get dada() { return this.given; },
        get dados() { return this.given; },
        get dadas() { return this.given; },
        get quando() { return this.when; },
        get se() { return this.when; },
        get entao() { return this.then; }
    };

    return new Language('Portuguese', vocabulary);
})();
