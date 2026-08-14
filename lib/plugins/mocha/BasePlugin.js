const Localisation = require('../../localisation');
const FeatureFileParser = require('../../parsers/FeatureFileParser');
const $ = require('../../Array');

module.exports.create = (options) => {
  const language = options.language || Localisation.default;
  const parser = options.parser || new FeatureFileParser(options);
  const container = options.container || global;

  function featureFiles(files, iterator) {
    $(files).each((file) => {
      features(parser.parse(file), iterator);
    });
  }

  function features(features, iterator) {
    $(features).each((feature) => {
      describe(feature.title, feature, iterator);
    });
  }

  function rules(rules, iterator) {
    $(rules).each((rule) => {
      describe(rule.title, rule, iterator);
    });
  }

  function describe(title, subject, iterator) {
    const _describe = getDescribe(subject.annotations);
    _describe(title, () => {
      iterator(subject);
    });
  }

  function it_async(title, subject, iterator) {
    const _it = getIt(subject.annotations);
    _it(title, function (done) {
      iterator(this, subject, done);
    });
  }

  function it_sync(title, subject, iterator) {
    const _it = getIt(subject.annotations);
    _it(title, function () {
      iterator(this, subject);
    });
  }

  function getIt(annotations, next) {
    if (has_annotation(annotations, 'pending')) return container.xit;
    if (has_annotation(annotations, 'only')) return container.it.only || container.fit || container.iit;
    return container.it;
  }

  function getDescribe(annotations, next) {
    if (has_annotation(annotations, 'pending')) return container.xdescribe;
    if (has_annotation(annotations, 'only')) return container.describe.only || container.fdescribe || container.ddescribe;
    return container.describe;
  }

  function has_annotation(annotations, name) {
    const regexp = new RegExp(`^${language.localise(name)}$`, 'i');
    for (const key in annotations) {
      if (regexp.test(key)) return true;
    }
  }

  return {
    featureFiles: featureFiles,
    features: features,
    rules: rules,
    describe: describe,
    it_async: it_async,
    it_sync: it_sync,
  };
};
