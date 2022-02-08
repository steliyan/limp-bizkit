const { assign, createMachine, sendParent } = require('xstate');

const INTERVAL_IN_SECONDS = 0.1;

const START_EVENT = 'START';
const STOP_EVENT = 'STOP';
const TICK_EVENT = 'TICK';

const STARTED_STATE = 'STARTED';
const STOPPED_STATE = 'STOPPED';

const tickMachine = createMachine({
  initial: STOPPED_STATE,
  context: {
    elapsed: 0,
  },
  states: {
    [STARTED_STATE]: {
      invoke: {
        src: () => (cb) => {
          const intervalId = setInterval(
            () => cb(TICK_EVENT),
            1000 * INTERVAL_IN_SECONDS
          );

          return () => clearInterval(intervalId);
        },
      },
      on: {
        [STOP_EVENT]: STOPPED_STATE,
        [TICK_EVENT]: {
          actions: [
            assign({
              elapsed: (context) =>
                +(context.elapsed + INTERVAL_IN_SECONDS).toFixed(2),
            }),
            sendParent( TICK_EVENT),
          ],
        },
      },
    },
    [STOPPED_STATE]: {
      on: {
        [START_EVENT]: STARTED_STATE,
      },
    },
  },
});

module.exports = { tickMachine, START_EVENT, STOP_EVENT, TICK_EVENT };
