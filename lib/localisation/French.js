"use strict";

var Language = require('./Language');

module.exports = (function() {

    var vocabulary = {
        feature: '(?:[Ff]onctionnalité)',
        scenario: '(?:[Ss]cénario|[Pp]lan [Dd]u [Ss]cénario)',
        examples: '(?:[Ee]xemples|[Ee]xemple|[Oo][uù])',
        pending: '(?:[Ee]n attente|[Ee]n cours|[Tt]odo)',
        only: '(?:[Ss]eulement])',
        background: '(?:[Cc]ontexte)',
        given: '(?:[Ss]oit|[ÉéEe]tant données|[ÉéEe]tant donnée|[ÉéEe]tant donnés|[ÉéEe]tant donné|[Aa]vec|[Ee]t|[Mm]ais|[Aa]ttendre)',
        when: '(?:[Qq]uand|[Ll]orsqu\'|[Ll]orsque|[Ss]i|[Ee]t|[Mm]ais)',
        then: '(?:[Aa]lors|[Aa]ttendre|[Ee]t|[Mm]ais)',

        _steps: [
            'given', 'when', 'then',
            'soit', 'etantdonnees', 'etantdonnee', 'etantdonne',
            'quand', 'lorsque',
            'alors'
        ],
        // Also aliasing French verbs for given-when-then for signature-lookup
        get soit() { return this.given; },
        get etantdonnees() { return this.given; },
        get etantdonnee() { return this.given; },
        get etantdonne() { return this.given; },
        get quand() { return this.when; },
        get lorsque() { return this.when; },
        get alors() { return this.then; }
    };

    return new Language('French', vocabulary);
})();
