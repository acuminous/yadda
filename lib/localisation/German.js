/*
* Copyright 2010 Acuminous Ltd / Energized Work Ltd
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
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
        feature: '(?:[Ff]unktionalität|[Ff]eature|[Aa]spekt|[Uu]secase|[Aa]nwendungsfall)',
        scenario: '(?:[Ss]zenario|[Ss]zenario( g|G)rundriss|[Gg]eschehnis)',
        examples: '(?:[Bb]eispiele?)',
        pending: '(?:[Tt]odo|[Oo]ffen)',
        only: '(?:[Nn]ur|[Ee]inzig)',
        background: '(?:[Gg]rundlage|[Hh]intergrund|[Ss]etup|[Vv]orausgesetzt)',
        given: '(?:[Aa]ngenommen|[Gg]egeben( sei(en)?)?|[Mm]it|[Uu]nd|[Aa]ber|[Aa]ußer)',
        when: '(?:[Ww]enn|[Ff]alls|[Uu]nd|[Aa]ber)',
        then: '(?:[Dd]ann|[Ff]olglich|[Aa]ußer|[Uu]nd|[Aa]ber)',
        _steps: ['given', 'when', 'then']
    };

    return new Language('German', vocabulary);
})();
