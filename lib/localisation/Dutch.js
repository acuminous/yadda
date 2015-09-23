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
        feature: '(?:[Ff]eature|[Ff]unctionaliteit|[Ee]igenschap)',
        scenario: '(?:[Ss]cenario|[Gg|eval)',
        examples: '(?:[Vv]oorbeelden?)',
        pending: '(?:[Tt]odo|[Mm]oet nog)',
        only: '(?:[Aa]lleen)',
        background: '(?:[Aa]chtergrond)',
        given: '(?:[Ss]tel|[Gg]egeven(?:\\sdat)?|[Ee]n|[Mm]aar)',
        when: '(?:[Aa]ls|[Ww]anneer|[Ee]n|[Mm]aar)',
        then: '(?:[Dd]an|[Vv]ervolgens|[Ee]n|[Mm]aar)',
        _steps: ['given', 'when', 'then']
    };

    return new Language('Dutch', vocabulary);
})();
