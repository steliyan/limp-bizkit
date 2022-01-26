const EventEmitter = require('events');

class BizkitMachine {
  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  start() {
    this.eventEmitter.emit('foo');
  }

  stop() {
    this.eventEmitter.emit('foo');
  }

  pause() {
    this.eventEmitter.emit('foo');
  }

  subscribe(name, callback) {
    this.eventEmitter.on(name, callback);
  }

  unsubsribe(name, callback) {
    this.eventEmitter.off(name, callback);
  }
}


module.exports = BizkitMachine;
