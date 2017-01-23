"use strict";

module.exports = {
    casper: require('./CasperPlugin'),
    mocha: {
        ScenarioLevelPlugin: require('./mocha/ScenarioLevelPlugin'),
        StepLevelPlugin: require('./mocha/StepLevelPlugin')
    },
    get jasmine() {
        return this.mocha;
    }
};
