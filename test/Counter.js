module.exports = function () {
  let tally = 0;

  this.count = (next) => {
    tally++;
    next && next();
  };

  this.total = () => tally;
};
