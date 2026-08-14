const Yadda = require('yadda');
const { featureFile, scenarios, steps } = Yadda.plugins.nodetest.StepLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each((file) => {
  const MiddletonHospital = {
    getWard(speciality) {
      return this.wards[speciality];
    },
    wards: {
      respiratory: {
        admit(patient, timestamp) {
          patient.ward = this;
          patient.admission = timestamp;
        },
        scheduleDischarge(patient, timestamp) {
          patient.discharge = { time: timestamp };
        },
      },
    },
  };

  featureFile(file, (feature) => {
    const libraries = [require('./lib/hospital-library'), require('./lib/patient-library'), require('./lib/discharge-library')];

    const yadda = Yadda.createInstance(libraries);

    scenarios(feature.scenarios, (scenario) => {
      const ctx = { hospitals: { Middleton: MiddletonHospital } };
      steps(scenario.steps, (step, done) => {
        yadda.run(step, { ctx: ctx }, done);
      });
    });
  });
});
