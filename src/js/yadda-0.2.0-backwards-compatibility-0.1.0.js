Steps = Yadda.Library;

Yadda.Library.prototype.prime = function(steps) {
    this.libraries = steps;
};

Yadda.Library.prototype.addStep = Yadda.Library.prototype.define;

Yadda.Library.prototype.importSteps = function(steps) {
    for (var key in steps.steps) {
        var candidateStep = steps.steps[key];
        this.addStep(candidateStep.template, candidateStep.callable, candidateStep.stepContext);
    };
    return this;
};

Yadda.Library.prototype.given = function(template, callable, stepContext) {
    return this.addStep("(?:[Gg]iven|[Aa]nd|[Bb]ut) " + template, callable, stepContext);
};

Yadda.Library.prototype.when = function(template, callable, stepContext) {
    return this.addStep("(?:[Ww]hen|[Aa]nd|[Bb]ut) " + template, callable, stepContext);
};

Yadda.Library.prototype.then = function(template, callable, stepContext) {
    return this.addStep("(?:[Tt]hen|[Ee]xpect|[Aa]nd|[Bb]ut) " + template, callable, stepContext);
};
