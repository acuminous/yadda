const { describe, it } = require('node:test');
const { equal: eq, fail, ok } = require('node:assert');
const { Interpreter, ContextBoundLibrary, localisation } = require('../lib/index');
const Counter = require('./Counter');

describe('Localisation', () => {
  it('should match text from the beginning', () => {
    const counter = new Counter();
    const library = localisation.English.localise(new ContextBoundLibrary())
      .given('a post', () => {
        fail('Step should not have been matched');
      })
      .define(/.*/, counter.count);

    new Interpreter(library).interpret(['Given a patient with anxiety and a post-traumatic stress disorder']);

    eq(counter.total(), 1);
  });

  it('should support English', () => {
    const counter = new Counter();
    const library = localisation.English.localise(new ContextBoundLibrary()).given('some text 1', counter.count).when('some text 2', counter.count).then('some text 4', counter.count);

    new Interpreter(library).interpret(['given some text 1', 'when some text 2', 'then some text 4']);

    eq(counter.total(), 3);
  });

  it('should support German', () => {
    const counter = new Counter();
    const library = localisation.German.localise(new ContextBoundLibrary()).given('some text 1', counter.count).when('some text 2', counter.count).then('some text 4', counter.count);

    new Interpreter(library).interpret(['angenommen some text 1', 'wenn some text 2', 'dann some text 4']);

    eq(counter.total(), 3);
  });

  it('should support Dutch', () => {
    const counter = new Counter();
    const library = localisation.Dutch.localise(new ContextBoundLibrary()).given('some text 1', counter.count).when('some text 2', counter.count).then('some text 4', counter.count);

    new Interpreter(library).interpret(['Gegeven dat some text 1', 'Wanneer some text 2', 'Dan some text 4']);

    eq(counter.total(), 3);
  });

  it('should support French', () => {
    const counter = new Counter();
    const library = localisation.French.localise(new ContextBoundLibrary())
      .soit('some text 1', counter.count)
      .etantdonnees('some text 2', counter.count)
      .etantdonnee('some text 3', counter.count)
      .etantdonne('some text 4', counter.count)
      .given('some text 5', counter.count)

      .quand('some text 6', counter.count)
      .lorsque('some text 7', counter.count)
      .when('some text 8', counter.count)

      .alors('some text 9', counter.count)
      .then('some text 10', counter.count);

    new Interpreter(library).interpret(['soit some text 1', 'étant données some text 2', 'étant donnée some text 3', 'étant donné some text 4', 'soit some text 5', 'quand some text 6', 'lorsque some text 7', 'quand some text 8', 'alors some text 9', 'alors some text 10']);

    eq(counter.total(), 10);
  });

  it('should support Norwegian', () => {
    const counter = new Counter();
    const library = localisation.Norwegian.localise(new ContextBoundLibrary())
      .gitt('some text 1', counter.count)
      .given('some text 2', counter.count)

      .når('some text 3', counter.count)
      .when('some text 4', counter.count)

      .så('some text 5', counter.count)
      .then('some text 6', counter.count);

    new Interpreter(library).interpret(['gitt some text 1', 'gitt some text 2', 'når some text 3', 'når some text 4', 'så some text 5', 'så some text 6']);

    eq(counter.total(), 6);
  });

  it('should support Piracy', () => {
    const counter = new Counter();
    const library = localisation.Pirate.localise(new ContextBoundLibrary())
      .giveth('some text 1', counter.count)
      .given('some text 2', counter.count)

      .whence('some text 3', counter.count)
      .when('some text 4', counter.count)

      .thence('some text 5', counter.count)
      .then('some text 6', counter.count);

    new Interpreter(library).interpret(['giveth some text 1', 'giveth some text 2', 'whence some text 3', 'whence some text 4', 'thence some text 5', 'thence some text 6']);

    eq(counter.total(), 6);
  });

  it('should support Ukrainian', () => {
    const counter = new Counter();
    const library = localisation.Ukrainian.localise(new ContextBoundLibrary()).given('some text 1', counter.count).when('some text 2', counter.count).then('some text 3', counter.count);

    new Interpreter(library).interpret(['дано some text 1', 'коли some text 2', 'тоді some text 3']);

    eq(counter.total(), 3);
  });

  it('should support Polish', () => {
    const counter = new Counter();
    const library = localisation.Polish.localise(new ContextBoundLibrary())
      .zakladajac('some text 1', counter.count)
      .majac('some text 2', counter.count)
      .given('some text 3', counter.count)

      .jezeli('some text 4', counter.count)
      .jesli('some text 5', counter.count)
      .gdy('some text 6', counter.count)
      .kiedy('some text 7', counter.count)
      .when('some text 8', counter.count)

      .wtedy('some text 9', counter.count)
      .then('some text 10', counter.count);

    new Interpreter(library).interpret(['zakładając some text 1', 'mając some text 2', 'zakładając some text 3', 'jeżeli some text 4', 'jeśli some text 5', 'gdy some text 6', 'kiedy some text 7', 'jeżeli some text 8', 'wtedy some text 9', 'wtedy some text 10']);

    eq(counter.total(), 10);
  });

  it('should support Spanish', () => {
    const counter = new Counter();
    const library = localisation.Spanish.localise(new ContextBoundLibrary())
      .sea('some text 1', counter.count)
      .sean('some text 2', counter.count)
      .dado('some text 3', counter.count)
      .dada('some text 4', counter.count)
      .dados('some text 5', counter.count)
      .dadas('some text 6', counter.count)
      .given('some text 7', counter.count)

      .cuando('some text 8', counter.count)
      .si('some text 9', counter.count)
      .when('some text 10', counter.count)

      .entonces('some text 11', counter.count)
      .then('some text 12', counter.count);

    new Interpreter(library).interpret(['sea some text 1', 'sean some text 2', 'dado some text 3', 'dada some text 4', 'dados some text 5', 'dadas some text 6', 'sea some text 7', 'cuando some text 8', 'si some text 9', 'cuando some text 10', 'entonces some text 11', 'entonces some text 12']);

    eq(counter.total(), 12);
  });

  it('should support Russian', () => {
    const counter = new Counter();
    const library = localisation.Russian.localise(new ContextBoundLibrary()).given('some text 1', counter.count).when('some text 2', counter.count).then('some text 4', counter.count);

    new Interpreter(library).interpret(['допустим some text 1', 'если some text 2', 'то some text 4']);

    eq(counter.total(), 3);
  });

  it('should support Portuguese', () => {
    const counter = new Counter();

    const library = localisation.Portuguese.localise(new ContextBoundLibrary())
      .seja('some text 1', counter.count)
      .sejam('some text 2', counter.count)
      .dado('some text 3', counter.count)
      .dada('some text 4', counter.count)
      .dados('some text 5', counter.count)
      .dadas('some text 6', counter.count)
      .given('some text 7', counter.count)
      .given('some text 8', counter.count)
      .when('some text 9', counter.count)

      .quando('some text 10', counter.count)
      .se('some text 11', counter.count)
      .when('some text 12', counter.count)
      .when('some text 13', counter.count)
      .when('some text 14', counter.count)

      .entao('some text 15', counter.count)
      .then('some text 16', counter.count)

      .entao('some text 17', counter.count)
      .entao('some text 18', counter.count);

    new Interpreter(library).interpret([
      'seja some text 1',
      'sejam some text 2',
      'dado some text 3',
      'dada some text 4',
      'dados some text 5',
      'dadas some text 6',
      'seja some text 7',
      'e some text 8',
      'mas some text 9',

      'quando some text 10',
      'se some text 11',
      'quando some text 12',
      'e some text 13',
      'mas some text 14',

      'então some text 15',
      'entao some text 16',
      'e some text 17',
      'mas some text 18',
    ]);

    eq(counter.total(), 18);
  });

  describe('deprecated library() factory', () => {
    it('should create and localise a context-bound library', () => {
      const counter = new Counter();
      const library = localisation.English.library().given('some text 1', counter.count).when('some text 2', counter.count).then('some text 4', counter.count);

      ok(library instanceof ContextBoundLibrary);

      new Interpreter(library).interpret(['given some text 1', 'when some text 2', 'then some text 4']);

      eq(counter.total(), 3);
    });

    it('should emit a deprecation warning', (_t, done) => {
      const onWarning = (warning) => {
        eq(warning.name, 'DeprecationWarning');
        ok(warning.message.includes('library() is deprecated'));
        done();
      };
      process.once('warning', onWarning);
      localisation.English.library();
    });
  });
});
