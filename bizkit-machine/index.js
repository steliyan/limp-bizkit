const EventEmitter = require("events");
const cm = require("@xstate/fsm");

class BizkitMachine {
  constructor() {
    this.eventEmitter = new EventEmitter();
    const a = 32;
  }

  start() {
    this.eventEmitter.emit("foo");
  }

  stop() {
    this.eventEmitter.emit("foo");
  }

  pause() {
    this.eventEmitter.emit("foo");
  }

  subscribe(name, callback) {
    this.eventEmitter.on(name, callback);
  }

  unsubsribe(name, callback) {
    this.eventEmitter.off(name, callback);
  }
}

module.exports = BizkitMachine;
