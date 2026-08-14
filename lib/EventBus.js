const $ = require('./Array');
const fn = require('./fn');
const event_bus = new EventBus();

// A communication channel between event emitters and event listeners
function EventBus() {
  const event_handlers = $();

  this.send = function (event_name, event_data, next) {
    if (arguments.length === 1) return this.send(event_name, {});
    if (arguments.length === 2 && fn.is_function(event_data)) return this.send(event_name, {}, event_data);
    notify_handlers(event_name, event_data);
    next && next();
    return this;
  };

  this.on = function (event_pattern, callback) {
    event_handlers.push({ pattern: event_pattern, callback: callback });
    return this;
  };

  const notify_handlers = (event_name, event_data) => {
    find_handlers(event_name).each((callback) => {
      callback({ name: event_name, data: event_data });
    });
  };

  const find_handlers = (event_name) => event_handlers.find_all((handler) => new RegExp(handler.pattern).test(event_name)).collect((handler) => handler.callback);
}

function instance() {
  return event_bus;
}

module.exports = {
  instance: instance,
  ON_SCENARIO: '__ON_SCENARIO__',
  ON_STEP: '__ON_STEP__',
  ON_EXECUTE: '__ON_EXECUTE__',
  ON_DEFINE: '__ON_DEFINE__',
};
