const Competition = require('./Competition');
const Context = require('./Context');
const EventBus = require('./EventBus');
const $ = require('./Array');
const fn = require('./fn');

// Understands a scenario
const Interpreter = function (libraries) {
  libraries = $(libraries);
  const event_bus = EventBus.instance();
  let last_macro;

  this.requires = function (libs) {
    libraries.push_all(libs);
    return this;
  };

  this.validate = (scenario) => {
    const results = $(scenario).collect((step) => {
      const report = this.rank_macros(step).validate();
      last_macro = report.winner;
      return report;
    });
    if (results.find(by_invalid_step)) throw new Error(`Scenario cannot be interpreted\n${results.collect(validation_report).join('\n')}`);
  };

  function by_invalid_step(result) {
    return !result.valid;
  }

  function validation_report(result) {
    return result.step + (result.valid ? '' : ` <-- ${result.reason}`);
  }

  this.interpret = (scenario, scenario_context, next) => {
    scenario_context = new Context().merge(scenario_context);
    event_bus.send(EventBus.ON_SCENARIO, { scenario: scenario, ctx: scenario_context.properties });
    const iterator = make_step_iterator(scenario_context, next);
    $(scenario).each_async(iterator, next);
  };

  const make_step_iterator = (scenario_context, next) => {
    const iterator = (step, _index, callback) => {
      this.interpret_step(step, scenario_context, callback);
    };
    return next ? iterator : fn.asynchronize(null, iterator);
  };

  this.interpret_step = function (step, scenario_context, next) {
    const context = new Context().merge(scenario_context);
    event_bus.send(EventBus.ON_STEP, { step: step, ctx: context.properties });
    const macro = this.rank_macros(step).clear_winner();
    last_macro = macro;
    macro.interpret(step, context || {}, next);
  };

  this.rank_macros = (step) => new Competition(step, compatible_macros(step), last_macro);

  const compatible_macros = (step) => libraries.inject([], (macros, library) => macros.concat(library.find_compatible_macros(step)));
};

module.exports = Interpreter;
