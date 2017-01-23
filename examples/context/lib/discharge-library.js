"use strict";

var Yadda = require('yadda');
var assert = require('assert');

module.exports = (function() {

    var ONE_DAY_IN_MILLIS = 24 * 60 * 60 * 1000;

    var library = new Yadda.Library()

        .define('His condition has improved sufficiently for him to be scheduled for discharge (today|tomorrow) at $time.', function(day, time, next) {
            var patient = this.ctx.patient;
            var timestamp = toTime(day, time);
            patient.ward.scheduleDischarge(patient, timestamp);
            next();
        })

        .define(['He requires a $requirement', 'He requires a $requirement and some $requirement.'], function() {
            var next = Array.prototype.pop.apply(arguments);
            var requirements = Array.prototype.slice.apply(arguments);
            var patient = this.ctx.patient;
            patient.discharge.requirements = requirements;
            next();
        }, {}, { mode: 'async' });

    function toTime(day, time) {
        var offset = day == 'today' ? 0 : ONE_DAY_IN_MILLIS;
        return Date.parse(new Date().toString().replace(/\d{2}:\d{2}:\d{2}/, time + ':00')) + offset;
    }

    return library;

})();
