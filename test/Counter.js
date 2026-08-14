module.exports = function () {
  var tally = 0;

  this.count = (next) => {
    tally++;
    next?.();
  };

  this.total = () => tally;
};
