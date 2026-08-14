const { describe, it } = require('node:test');
const { equal: eq, deepEqual: deq, ok } = require('node:assert');
const EventBus = require('../lib/EventBus');

describe('EventBus', () => {
  const bus = EventBus.instance();

  it('should carry an event to a listener', () => {
    const listener = new Listener();
    bus.on('foo', listener.listen).send('foo');

    eq(1, listener.events.length);
    assert_event('foo', {}, listener.events[0]);
  });

  it('should allow events to include data', () => {
    const listener = new Listener();
    bus.on('foo', listener.listen).send('foo', { foo: 'bar' });

    eq(1, listener.events.length);
    assert_event('foo', { foo: 'bar' }, listener.events[0]);
  });

  it('should carry an event to multiple listeners', () => {
    const listener1 = new Listener();
    const listener2 = new Listener();
    bus.on('foo', listener1.listen).on('foo', listener2.listen).send('foo');

    eq(1, listener1.events.length);
    eq(1, listener2.events.length);
  });

  it('should send all matching events to a listener', () => {
    const listener = new Listener();
    bus.on(/f.*/, listener.listen).send('foo');
    eq(1, listener.events.length);
  });

  it('should not send unmatched events to a listener', () => {
    const listener = new Listener();
    bus.on(/f.*/, listener.listen).send('bar');
    eq(0, listener.events.length);
  });

  it('should execute callbacks without event data', (_t, done) => {
    const listener = new Listener();
    bus.on(/f.*/, listener.listen).send('bar', done);
  });

  it('should execute callbacks with event data', (_t, done) => {
    const listener = new Listener();
    bus.on(/f.*/, listener.listen).send('bar', {}, done);
  });

  function Listener() {
    this.events = [];
    this.listen = (event) => {
      this.events.push(event);
    };
  }

  function assert_event(name, data, event) {
    ok(event);
    eq(name, event.name);
    deq(data, event.data);
  }
});
