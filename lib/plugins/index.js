module.exports = {
  mocha: {
    ScenarioLevelPlugin: require('./mocha/ScenarioLevelPlugin'),
    StepLevelPlugin: require('./mocha/StepLevelPlugin'),
  },
  get jasmine() {
    return this.mocha;
  },
};
