"use strict";

var $ = require('./Array');
var fn = require('./fn');
var event_bus = new EventBus();

// A communication channel between event emitters and event listeners
function EventBus() {

    var event_handlers = $();

    this.send = function(event_name, event_data, next) {
        if (arguments.length === 1) return this.send(event_name, {});
        if (arguments.length === 2 && fn.is_function(event_data)) return this.send(event_name, {}, event_data);
        notify_handlers(event_name, event_data);
        next && next();
        return this;
    };

    this.on = function(event_pattern, callback) {
        event_handlers.push({ pattern: event_pattern, callback: callback });
        return this;
    };

    var notify_handlers = function(event_name, event_data) {
        find_handlers(event_name).each(function(callback) {
            callback({ name: event_name, data: event_data });
        });
    };

    var find_handlers = function(event_name) {
        return event_handlers.find_all(function(handler) {
            return new RegExp(handler.pattern).test(event_name);
        }).collect(function(handler) {
            return handler.callback;
        });
    };
}

function instance() {
    return event_bus;
}

module.exports = {
    instance: instance,
    ON_SCENARIO: '__ON_SCENARIO__',
    ON_STEP: '__ON_STEP__',
    ON_EXECUTE: '__ON_EXECUTE__',
    ON_DEFINE: '__ON_DEFINE__'
};
