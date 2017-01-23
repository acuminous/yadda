"use strict";

module.exports = {

    trim: function trim(text) {
        return text.replace(/^\s+|\s+$/g, '');
    },
    rtrim: function rtrim(text) {
        return text.replace(/\s+$/g, '');
    },
    isBlank: function isBlank(text) {
        return /^\s*$/g.test(text);
    },
    isNotBlank: function isNotBlank(text) {
        return !this.isBlank(text);
    },
    indentation: function indentation(text) {
        var match = /^(\s*)/.exec(text);
        return match && match[0].length || 0;
    }
};
