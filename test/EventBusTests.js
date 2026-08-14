var nodeTest = require('node:test');
var describe = nodeTest.describe;
var it = nodeTest.it;
var assert = require('node:assert');
var EventBus = require('../lib/EventBus');

describe('EventBus', () => {
  var bus = EventBus.instance();

  it('should carry an event to a listener', () => {
    var listener = new Listener();
    bus.on('foo', listener.listen).send('foo');

    assert.equal(1, listener.events.length);
    assert_event('foo', {}, listener.events[0]);
  });

  it('should allow events to include data', () => {
    var listener = new Listener();
    bus.on('foo', listener.listen).send('foo', { foo: 'bar' });

    assert.equal(1, listener.events.length);
    assert_event('foo', { foo: 'bar' }, listener.events[0]);
  });

  it('should carry an event to multiple listeners', () => {
    var listener1 = new Listener();
    var listener2 = new Listener();
    bus.on('foo', listener1.listen).on('foo', listener2.listen).send('foo');

    assert.equal(1, listener1.events.length);
    assert.equal(1, listener2.events.length);
  });

  it('should send all matching events to a listener', () => {
    var listener = new Listener();
    bus.on(/f.*/, listener.listen).send('foo');
    assert.equal(1, listener.events.length);
  });

  it('should not send unmatched events to a listener', () => {
    var listener = new Listener();
    bus.on(/f.*/, listener.listen).send('bar');
    assert.equal(0, listener.events.length);
  });

  it('should execute callbacks without event data', (t, done) => {
    var listener = new Listener();
    bus.on(/f.*/, listener.listen).send('bar', done);
  });

  it('should execute callbacks with event data', (t, done) => {
    var listener = new Listener();
    bus.on(/f.*/, listener.listen).send('bar', {}, done);
  });

  function Listener() {
    this.events = [];
    this.listen = (event) => {
      this.events.push(event);
    };
  }

  function assert_event(name, data, event) {
    assert.ok(event);
    assert.equal(name, event.name);
    assert.deepEqual(data, event.data);
  }
});
