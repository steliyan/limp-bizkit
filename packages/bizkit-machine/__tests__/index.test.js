const { actions, interpret, createMachine, assign } = require('xstate');
const tickMachine = require('../tick');

const LO_TEMP_THRESHOLD = 220;
const HI_TEMP_THRESHOLD = 240;
const AMBIENT_TEMP = 20;

const shouldTurnOvenOn = (ctx, _, { state }) => {
  const temp = state.context.temp;

  if (temp <= LO_TEMP_THRESHOLD) {
    return true;
  }

  if (temp >= HI_TEMP_THRESHOLD) {
    return false;
  }

  const prevTemp = state.history.context.temp;

  return temp >= prevTemp;
};

const bizkit = createMachine(
  {
    initial: 'stopped',
    context: {
      temp: AMBIENT_TEMP,
    },
    states: {
      stopped: {
        initial: 'fully_stopped',
        states: {
          cooling_down: {
            always: [
              {
                target: 'fully_stopped',
                cond: ({ temp }) => temp <= AMBIENT_TEMP,
              },
            ],
            invoke: {
              id: 'tick_2',
              src: tickMachine,
              data: { elapsed: 0, interval: 0.5 },
            },
            on: {
              TICK: { actions: ['coolDown'] },
              // COOL_DOWN: { actions: ['coolDown'] },
            },
          },
          fully_stopped: {
            always: [
              {
                target: 'cooling_down',
                cond: ({ temp }) => temp > AMBIENT_TEMP,
              },
            ],
          },
        },
        on: {
          turn_on: 'started',
        },
      },
      started: {
        initial: 'running',
        invoke: {
          id: 'tick',
          src: tickMachine,
          data: { elapsed: 0, interval: 0.5 },
        },
        states: {
          paused: {},
          running: {},
        },

        on: {
          TICK: {
            actions: [
              actions.choose([
                {
                  cond: (...args) => shouldTurnOvenOn(...args),
                  actions: ['heatUp'],
                },
                {
                  cond: (...args) => !shouldTurnOvenOn(...args),
                  actions: ['coolDown'],
                },
              ]),
            ],
          },
        },
      },
    },
    on: {
      turn_on: 'started',
      turn_off: 'stopped',
    },
  },
  {
    actions: {
      heatUp: assign({ temp: ({ temp }) => temp + 1 }),
      coolDown: assign({ temp: ({ temp }) => temp - 0.5 }),
    },
  }
);

jest.useFakeTimers();

test('should be fully stopped initially', () => {
  const m = interpret(bizkit);
  m.start();

  expect(m.state.value).toEqual({ stopped: 'fully_stopped' });

  m.stop();
});

test('should start on turn on', () => {
  const m = interpret(bizkit);
  m.start();

  m.send('turn_on');
  expect(m.state.value).toEqual({ started: 'running' });
  expect(m.state.context.temp).toEqual(20);

  m.send('turn_off');
  expect(m.state.value).toEqual({ stopped: 'fully_stopped' });
  expect(m.state.context.temp).toEqual(20);

  m.stop();
});

const generateEvents = (event, count = 1) => new Array(count).fill(event);

test('should tick when 1s passes', () => {
  const m = interpret(bizkit);
  m.start();

  m.send('turn_on');
  m.send('TICK');

  m.stop();
});

test('should heat up with 1 degree per tick', () => {
  const m = interpret(bizkit);
  m.start();

  m.send('turn_on');
  expect(m.state.value).toEqual({ started: 'running' });
  expect(m.state.context.temp).toEqual(20);

  m.send('TICK');
  expect(m.state.context.temp).toEqual(21);

  m.stop();
});

test('should heat up and cool down', () => {
  const m = interpret(bizkit);
  m.start();

  m.send('turn_on');
  expect(m.state.value).toEqual({ started: 'running' });
  expect(m.state.context.temp).toEqual(20);

  m.send(generateEvents('TICK', 5));
  expect(m.state.value).toEqual({ started: 'running' });
  expect(m.state.context.temp).toEqual(25);

  m.send('turn_off');
  expect(m.state.value).toEqual({ stopped: 'cooling_down' });
  expect(m.state.context.temp).toEqual(25);

  m.send(generateEvents('TICK', 10));
  expect(m.state.value).toEqual({ stopped: 'fully_stopped' });
  expect(m.state.context.temp).toEqual(20);

  m.stop();
});
