module.exports = {
  mocha: {
    ScenarioLevelPlugin: require('./mocha/ScenarioLevelPlugin'),
    StepLevelPlugin: require('./mocha/StepLevelPlugin'),
  },
  get jasmine() {
    return this.mocha;
  },
  nodetest: {
    ScenarioLevelPlugin: require('./nodetest/ScenarioLevelPlugin'),
    StepLevelPlugin: require('./nodetest/StepLevelPlugin'),
  },
};
