const { describe, it } = require('node:test');
const { equal: eq, deepEqual: deq, ok, throws } = require('node:assert');
const { Interpreter, EventBus, Library, Dictionary, Context } = require('../lib/index');
const Counter = require('./Counter');

describe('Interpreter', () => {
  it('should interpret a single line script', () => {
    const counter = new Counter();
    const library = new Library().define('Blah blah blah', counter.count);

    new Interpreter(library).interpret('Blah blah blah');

    eq(counter.total(), 1);
  });

  it('should interpret a multiline script', () => {
    const counter = new Counter();
    const library = new Library().define('Blah blah blah', counter.count);

    new Interpreter(library).interpret(['Blah blah blah', 'Blah blah blah']);

    eq(counter.total(), 2);
  });

  it('should validate scenarios', () => {
    const library = new Library()
      .define('This is defined')
      .define(/[Tt]his is ambiguous/)
      .define(/[tT]his is ambiguous/);

    throws(() => {
      new Interpreter(library).validate(['This is defined', 'This is undefined', 'This is ambiguous']);
    }, /Scenario cannot be interpreted\nThis is defined\nThis is undefined <-- Undefined Step\nThis is ambiguous <-- Ambiguous Step/);
  });

  it('should favour ambiguous steps from the same library as the previous step', () => {
    const library1 = new Library().define('Library 1').define(/[Tt]his is ambiguous/);
    const library2 = new Library().define('Library 2').define(/[tT]his is ambiguous/);

    new Interpreter([library1, library2]).validate(['Library 2', 'This is ambiguous']);
  });

  it('should utilise macros from different libraries', () => {
    const counter = new Counter();
    const library_1 = new Library().define('Blah blah blah', counter.count);
    const library_2 = new Library().define('Whatever', counter.count);

    new Interpreter([library_1, library_2]).interpret(['Blah blah blah', 'Whatever']);

    eq(counter.total(), 2);
  });

  it('should expanded terms to discern macros', () => {
    let patient_name;

    const dictionary = new Dictionary().define('gender', '(male|female)').define('speciality', '(cardio|elderly care)');

    const library = new Library(dictionary)
      .define('Given a $gender patient called $name', (_gender, name) => {
        patient_name = name;
      })
      .define('Given a $speciality patient called $name', (_speciality, name) => {
        patient_name = name;
      });

    new Interpreter(library).interpret('Given a female patient called Carol');
    eq('Carol', patient_name);

    new Interpreter(library).interpret('Given a cardio patient called Bobby');
    eq('Bobby', patient_name);
  });

  it('should report undefined steps', () => {
    const library = new Library();
    const interpreter = new Interpreter(library);

    throws(() => {
      interpreter.interpret('Blah blah blah');
    }, /Undefined Step: \[Blah blah blah\]/);
  });

  it('should interpret steps asynchronously', (_t, done) => {
    const counter = new Counter();
    const library = new Library().define('Blah blah blah', counter.count);

    new Interpreter(library).interpret(['Blah blah blah', 'Blah blah blah'], {}, () => {
      eq(counter.total(), 2);
      done();
    });
  });

  it('should support variadic asynchronous steps', (_t, done) => {
    const counter = new Counter();
    const library = new Library().define(
      ['Blah (blah)', 'Blah (blah) (blah)'],
      function () {
        counter.count();
        arguments[arguments.length - 1]();
      },
      {},
      { mode: 'async' },
    );

    new Interpreter(library).interpret(['Blah blah', 'Blah blah blah'], {}, () => {
      eq(counter.total(), 2);
      done();
    });
  });

  it('should bind the context to the macro', (_t, done) => {
    const context = new Context({ foo: 'bar' });
    const library = new Library().define('Blah blah blah', function (next) {
      eq(this.foo, 'bar');
      next();
    });

    new Interpreter(library).interpret(['Blah blah blah', 'Blah blah blah'], context, done);
  });

  it('should notify listeners of interpreter events', (_t, done) => {
    const library = new Library().define('Blah blah blah');
    const interpreter = new Interpreter(library);
    const listener = new Listener();
    EventBus.instance().on(/STEP|SCENARIO/, listener.listen);

    interpreter.interpret('Blah blah blah', new Context({ foo: 'bar' }));

    eq(2, listener.events.length);

    assert_event(
      {
        name: EventBus.ON_SCENARIO,
        data: { scenario: 'Blah blah blah', ctx: { foo: 'bar' } },
      },
      listener.events[0],
    );

    assert_event(
      {
        name: EventBus.ON_STEP,
        data: { step: 'Blah blah blah', ctx: { foo: 'bar' } },
      },
      listener.events[1],
    );

    done();
  });

  it('should catch errors thrown by asynchronous steps where possible', () => {
    const library = new Library().define('Blah blah blah', (_next) => {
      throw new Error('Oh Noes!');
    });

    new Interpreter(library).interpret('Blah blah blah', {}, (err) => {
      ok(err);
      eq(err.message, 'Oh Noes!');
    });
  });

  function Listener() {
    this.events = [];
    this.listen = (event) => {
      this.events.push(event);
    };
  }

  function assert_event(expected, actual) {
    ok(actual);
    eq(expected.name, actual.name);
    deq(expected.data, actual.data);
  }
});
