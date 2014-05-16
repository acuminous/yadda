/* -*- coding: utf-8 -*-
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* jslint node: true */
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
