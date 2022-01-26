const { assign, createMachine, sendParent } = require('xstate');

const TICK_EVENT = 'TICK';

const START_TIMER_ACTION = 'START';
const STOP_TIMER_ACTION = 'STOP';
const STARTED_STATE = 'STARTED';
const STOPPED_STATE = 'STOPPED';

const tickMachine = createMachine({
  initial: STARTED_STATE,
  context: {
    elapsed: 0,
    interval: 0.1,
  },
  states: {
    [STARTED_STATE]: {
      invoke: {
        src: (context) => (cb) => {
          const intervalId = setInterval(
            () => cb(TICK_EVENT),
            1000 * context.interval
          );

          return () => clearInterval(intervalId);
        },
      },
      on: {
        [STOP_TIMER_ACTION]: STOPPED_STATE,
        [TICK_EVENT]: {
          actions: [
            assign({
              elapsed: (context) =>
                +(context.elapsed + context.interval).toFixed(2),
            }),
            sendParent(() => TICK_EVENT),
          ],
        },
      },
    },
    [STOPPED_STATE]: {
      type: 'final',
      on: {
        [START_TIMER_ACTION]: STARTED_STATE,
      },
    },
  },
});

module.exports = tickMachine;
