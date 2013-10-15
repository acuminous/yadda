module.exports = function(yadda, webdriver) {

    // var EventBus = require('yadda').EventBus;

    yadda.interpreter.interpret_step = function(step, ctx, next) {

        var _this = this;
        promise().then(function() {            
            // EventBus.instance().send(EventBus.ON_STEP, { step: step, ctx: ctx });        
            _this.rank_macros(step).clear_winner().interpret(step, ctx, next);            
        });
    };

    function promise() {
        var defer = webdriver.promise.defer();
        defer.fulfill();
        return defer.promise;
    }  
};