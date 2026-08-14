var Competition = require('./Competition');
var Context = require('./Context');
var EventBus = require('./EventBus');
var $ = require('./Array');
var fn = require('./fn');

// Understands a scenario
var Interpreter = function (libraries) {
  var libraries = $(libraries);
  var event_bus = EventBus.instance();
  var last_macro;

  this.requires = function (libs) {
    libraries.push_all(libs);
    return this;
  };

  this.validate = (scenario) => {
    var results = $(scenario).collect((step) => {
      var report = this.rank_macros(step).validate();
      last_macro = report.winner;
      return report;
    });
    if (results.find(by_invalid_step)) throw new Error('Scenario cannot be interpreted\n' + results.collect(validation_report).join('\n'));
  };

  function by_invalid_step(result) {
    return !result.valid;
  }

  function validation_report(result) {
    return result.step + (result.valid ? '' : ' <-- ' + result.reason);
  }

  this.interpret = (scenario, scenario_context, next) => {
    scenario_context = new Context().merge(scenario_context);
    event_bus.send(EventBus.ON_SCENARIO, { scenario: scenario, ctx: scenario_context.properties });
    var iterator = make_step_iterator(scenario_context, next);
    $(scenario).each_async(iterator, next);
  };

  var make_step_iterator = (scenario_context, next) => {
    var iterator = (step, index, callback) => {
      this.interpret_step(step, scenario_context, callback);
    };
    return next ? iterator : fn.asynchronize(null, iterator);
  };

  this.interpret_step = function (step, scenario_context, next) {
    var context = new Context().merge(scenario_context);
    event_bus.send(EventBus.ON_STEP, { step: step, ctx: context.properties });
    var macro = this.rank_macros(step).clear_winner();
    last_macro = macro;
    macro.interpret(step, context || {}, next);
  };

  this.rank_macros = (step) => new Competition(step, compatible_macros(step), last_macro);

  var compatible_macros = (step) => libraries.inject([], (macros, library) => macros.concat(library.find_compatible_macros(step)));
};

module.exports = Interpreter;
