const { interpret, createMachine, send } = require('xstate');
const {
  tickMachine,
  START_EVENT,
  STOP_EVENT,
  TICK_EVENT,
} = require('../tick-machine');

beforeEach(() => jest.useFakeTimers());

describe('state', () => {
  test('should be "STOPPED" initially', () => {
    const m = interpret(tickMachine);
    m.start();

    expect(m.initialState.value).toEqual('STOPPED');
    expect(m.initialState.context).toEqual({ elapsed: 0 });

    m.stop();
  });

  test('should transition to "STARTED" on "START"', () => {
    const m = interpret(tickMachine);
    m.start();

    m.send('START');
    expect(m.state.value).toEqual('STARTED');

    m.stop();
  });

  test('should transition to "STOPPED" on "STOP" when already "STARTED"', () => {
    const m = interpret(tickMachine);
    m.start();

    m.send('START');
    m.send('STOP');
    expect(m.state.value).toEqual('STOPPED');

    m.stop();
  });
});

describe('ticks', () => {
  const createParentTickMachine = (tickCb) =>
    createMachine({
      initial: '_running',
      states: {
        _stopped: {
          type: 'final',
        },
        _running: {
          invoke: {
            id: 'tick',
            src: {type: tickMachine},
          },
          entry: send({ type: START_EVENT }, { to: 'tick' }),
          exit: send({ type: STOP_EVENT }, { to: 'tick' }),
          on: {
            _STOP: '_stopped',
            [TICK_EVENT]: {
              actions: [tickCb],
            },
          },
        },
      },
    });

  test('should throw error when parent machine is not stopped', () => {
    const parent = interpret(createParentTickMachine(jest.fn()));
    parent.start();

    expect(() => parent.stop()).toThrowError();
  });

  [
    { advanceBy: 100, expectedCalledTimes: 1 },
    {
      advanceBy: 1234499,
      expectedCalledTimes: 12344,
    },
    {
      advanceBy: 1234500,
      expectedCalledTimes: 12345,
    },
    {
      advanceBy: 1234501,
      expectedCalledTimes: 12345,
    },
  ].forEach(({ advanceBy, expectedCalledTimes }) => {
    test(`should "TICK" ${expectedCalledTimes} times when running for ${advanceBy}ms`, () => {
      const cb = jest.fn();
      const parent = interpret(createParentTickMachine(cb));
      parent.start();

      const child = parent.children.get('tick');
      jest.advanceTimersByTime(advanceBy);

      parent.send('_STOP');
      parent.stop();

      expect(cb).toHaveBeenCalledTimes(expectedCalledTimes);
      expect(child.state.value).toBe('STOPPED');
    });
  });
});
