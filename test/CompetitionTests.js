const { describe, it } = require('node:test');
const { equal: eq, throws } = require('node:assert');
const Macro = require('../lib/Macro');
const Competition = require('../lib/Competition');
const Dictionary = require('../lib/Dictionary');
const fn = require('../lib/fn');

describe('Competition', () => {
  it('should decide winner by Levenshtein distance', () => {
    const best_match = new Macro('best', parsed_signature(/given 1 (.*) patient/));
    const middle_match = new Macro('middle', parsed_signature(/given (\d+) (.*) patient(?:s{0,1})/));
    const worst_match = new Macro('worse', parsed_signature(/given (\d+) (.*) (?:patient|patients)/));
    const competition = new Competition('given 1 male patient', [worst_match, best_match, middle_match]);

    eq(competition.clear_winner().signature, best_match.signature);
  });

  it('should decide winner by Levenshtein distance on multiline', () => {
    const best_match = new Macro('best', parsed_signature(/given 1 ([^\u0000]*) text/));
    const middle_match = new Macro('middle', parsed_signature(/given (\d+) ([^\u0000]*) text (?:s{0,1})/));
    const worst_match = new Macro('worse', parsed_signature(/given (\d+) ([^\u0000]*) (?:text|code)/));
    const competition = new Competition('given 1 a\nb\nc text', [worst_match, best_match, middle_match]);

    eq(competition.clear_winner().signature, best_match.signature);
  });

  it('should decide tie breakers by prefering to macro from the same library as the previous winner', () => {
    const library1 = { name: 'l1' };
    const library2 = { name: 'l2' };
    const previous_match = new Macro('previous', parsed_signature(/whatever/), fn.noop, {}, library1);
    const best_match = new Macro('best', parsed_signature(/given 1 (.*) patient/), fn.noop, {}, library1);
    const equal_match = new Macro('equal', parsed_signature(/given 1 (.+) patient/), fn.noop, {}, library2);
    const competition = new Competition('given 1 male patient', [best_match, equal_match], previous_match);

    eq(competition.clear_winner().signature, best_match.signature);
  });

  it('should support joint winners', () => {
    const library1 = { name: 'l1' };
    const previous_match = new Macro('previous', parsed_signature(/whatever/), fn.noop, {}, library1);
    const best_match = new Macro('best', parsed_signature(/given 1 (.*) patient/), fn.noop, {}, library1);
    const equal_match = new Macro('equal', parsed_signature(/given 1 (.+) patient/), fn.noop, {}, library1);
    const competition = new Competition('given 1 male patient', [best_match, equal_match], previous_match);

    throws(() => {
      competition.clear_winner();
    }, /Ambiguous Step: \[given 1 male patient\]. Patterns \[\/best\/, \/equal\/\] match equally well./);
  });

  it('should support multiline joint winners', () => {
    const best_match = new Macro('best', /given ([^\u0000]*) text/);
    const equal_match = new Macro('equal', /given ([^\u0000]+) text/);
    const competition = new Competition('given 1\n2\n3 text', [best_match, equal_match]);

    throws(() => {
      competition.clear_winner();
    }, /Ambiguous Step: \[given 1\n2\n3 text\]. Patterns \[\/best\/, \/equal\/\] match equally well./);
  });

  it('Should support no winner', () => {
    const competition = new Competition('given 1 male patient', []);

    throws(() => {
      competition.clear_winner();
    }, /Undefined Step: \[given 1 male patient\]/);
  });

  function parsed_signature(pattern) {
    return new Dictionary().define('foo', pattern).expand('$foo');
  }
});
