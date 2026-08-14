// Understands a collection of annotations
const Annotations = function () {
  const annotations = {};

  this.stash = (key, value) => {
    if (/\s/.test(key)) throw new Error(`Invalid annotation: ${key}`);
    annotations[key.toLowerCase()] = value;
  };

  this.export = () => annotations;
};

module.exports = Annotations;
