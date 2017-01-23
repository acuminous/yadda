"use strict";

var Language =  require('./Language');

module.exports = (function() {

    var vocabulary = {
        feature: '[Ff]eature|功能',
        scenario: '(?:[Ss]cenario|[Ss]cenario [Oo]utline|场景|剧本|(?:场景|剧本)?大纲)',
        examples: '(?:[Ee]xamples|[Ww]here|例子|示例|举例|样例)',
        pending: '(?:[Pp]ending|[Tt]odo|待定|待做|待办|暂停|暂缓)',
        only: '(?:[Oo]nly|仅仅?)',
        background: '[Bb]ackground|背景|前提',
        given: '(?:[Gg]iven|[Ww]ith|[Aa]nd|[Bb]ut|[Ee]xcept|假如|假设|假定|并且|而且|同时|但是)',
        when: '(?:[Ww]hen|[Ii]f|[Aa]nd|[Bb]ut|当|如果|并且|而且|同时|但是)',
        then: '(?:[Tt]hen|[Ee]xpect|[Aa]nd|[Bb]ut|那么|期望|并且|而且|同时|但是)',
        _steps: ['given', 'when', 'then']
    };

    return new Language('Chinese', vocabulary);
})();
