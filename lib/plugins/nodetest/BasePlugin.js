const Localisation = require('../../localisation');
const FeatureFileParser = require('../../parsers/FeatureFileParser');
const $ = require('../../Array');

module.exports.create = (options) => {
  const language = options.language || Localisation.default;
  const parser = options.parser || new FeatureFileParser(options);
  const runner = options.runner || require('node:test');

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
    runner.describe(title, describeOptions(subject.annotations), () => {
      iterator(subject);
    });
  }

  function it_async(title, subject, iterator) {
    runner.it(title, itOptions(subject.annotations), (t, done) => {
      iterator(t, subject, done);
    });
  }

  function it_sync(title, subject, iterator) {
    runner.it(title, itOptions(subject.annotations), (t) => {
      iterator(t, subject);
    });
  }

  function itOptions(annotations) {
    if (has_annotation(annotations, 'pending')) return { skip: true };
    if (has_annotation(annotations, 'only')) return { only: true };
    return {};
  }

  function describeOptions(annotations) {
    if (has_annotation(annotations, 'pending')) return { skip: true };
    if (has_annotation(annotations, 'only')) return { only: true };
    return {};
  }

  function has_annotation(annotations, name) {
    const regexp = new RegExp(`^${language.translate(name)}$`, 'i');
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
