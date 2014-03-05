module.exports = {
    casper: require('./CasperPlugin'),
    get mocha() { 
        var legacyPlugin = require('./MochaPlugin');
        legacyPlugin.AsyncScenarioLevelPlugin = require('./mocha/AsyncScenarioLevelPlugin');
        legacyPlugin.SyncScenarioLevelPlugin = require('./mocha/SyncScenarioLevelPlugin');
        legacyPlugin.AsyncStepLevelPlugin = require('./mocha/AsyncStepLevelPlugin');
        legacyPlugin.SyncStepLevelPlugin = require('./mocha/SyncStepLevelPlugin');
        return legacyPlugin;
    },
    get jasmine() { 
        return this.mocha
    }
}