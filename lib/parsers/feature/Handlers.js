const $ = require('../../Array');

// Understands a lookup table of event handlers
const Handlers = function (handlers = {}) {
  this.register = (event, handler) => {
    handlers[event] = handler;
  };

  this.unregister = function () {
    $(Array.prototype.slice.call(arguments)).each((event) => {
      delete handlers[event];
    });
  };

  this.find = (event) => {
    if (!handlers[event.toLowerCase()]) throw new Error(`${event} is unexpected at this time`);
    return { handle: handlers[event.toLowerCase()] };
  };
};

module.exports = Handlers;
