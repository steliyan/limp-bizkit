const { interpret } = require('xstate');
const {
  bizkitMachine,
  TURN_ON_EVENT,
  TURN_OFF_EVENT,
  PAUSED_EVENT,
} = require('../bizkit');

const nEvents = (event, count = 1) => new Array(count).fill(event);

describe('states', () => {
  test('should be fully stopped initially', () => {
    const m = interpret(bizkitMachine);
    m.start();

    expect(m.state.value).toEqual({ stopped: 'fully_stopped' });

    m.stop();
  });

  test('should start on turn on', () => {
    const m = interpret(bizkitMachine);
    m.start();

    m.send(TURN_ON_EVENT);
    expect(m.state.value).toEqual({ started: 'heating_up' });
    expect(m.state.context.temp).toEqual(20);

    m.send(TURN_OFF_EVENT);
    expect(m.state.value).toEqual({ stopped: 'fully_stopped' });
    expect(m.state.context.temp).toEqual(20);

    m.stop();
  });
});

describe('oven', () => {
  test('should heat up with 1 degree per tick when turned on', () => {
    const m = interpret(bizkitMachine);
    m.start();

    m.send(TURN_ON_EVENT);
    expect(m.state.value).toEqual({ started: 'heating_up' });
    expect(m.state.context.temp).toEqual(20);

    m.send('TICK');
    expect(m.state.context.temp).toEqual(21);

    m.send('TICK');
    expect(m.state.context.temp).toEqual(22);

    m.stop();
  });

  test('should cool down with 0.5 degrees per tick when turned off', () => {
    const m = interpret(bizkitMachine);
    m.start();

    m.send(TURN_ON_EVENT);
    expect(m.state.value).toEqual({ started: 'heating_up' });
    expect(m.state.context.temp).toEqual(20);

    m.send('TICK');
    m.send(TURN_OFF_EVENT);

    m.send('TICK');
    expect(m.state.context.temp).toEqual(20.5);
    expect(m.state.value).toEqual({ stopped: 'fully_stopped' });

    m.send('TICK');
    expect(m.state.context.temp).toEqual(20);
    expect(m.state.value).toEqual({ stopped: 'fully_stopped' });

    m.stop();
  });

  test('should keep the oven heated when started', () => {
    const m = interpret(bizkitMachine);
    m.start();

    m.send(TURN_ON_EVENT);
    expect(m.state.value).toEqual({ started: 'heating_up' });
    expect(m.state.context.temp).toEqual(20);

    m.send(nEvents('TICK', 200));
    expect(m.state.value).toEqual({ started: 'running' });
    expect(m.state.context.temp).toEqual(220);

    m.send(nEvents('TICK', 20));
    expect(m.state.value).toEqual({ started: 'running' });
    expect(m.state.context.temp).toEqual(240);

    m.send(nEvents('TICK', 10));
    expect(m.state.value).toEqual({ started: 'running' });
    expect(m.state.context.temp).toEqual(235);

    m.send(nEvents('TICK', 30));
    expect(m.state.value).toEqual({ started: 'running' });
    expect(m.state.context.temp).toEqual(220);

    m.send(nEvents('TICK', 10));
    expect(m.state.value).toEqual({ started: 'running' });
    expect(m.state.context.temp).toEqual(230);

    m.stop();
  });

  test('should keep the oven heated when started and then paused', () => {
    const m = interpret(bizkitMachine);
    m.start();

    m.send(TURN_ON_EVENT);
    expect(m.state.value).toEqual({ started: 'heating_up' });
    expect(m.state.context.temp).toEqual(20);

    m.send(nEvents('TICK', 200));
    expect(m.state.value).toEqual({ started: 'running' });
    expect(m.state.context.temp).toEqual(220);

    m.send(PAUSED_EVENT);
    expect(m.state.value).toEqual({ started: 'paused' });
    expect(m.state.context.temp).toEqual(220);

    m.send(nEvents('TICK', 20));
    expect(m.state.value).toEqual({ started: 'paused' });
    expect(m.state.context.temp).toEqual(240);

    m.send(nEvents('TICK', 10));
    expect(m.state.value).toEqual({ started: 'paused' });
    expect(m.state.context.temp).toEqual(235);

    m.send(nEvents('TICK', 30));
    expect(m.state.value).toEqual({ started: 'paused' });
    expect(m.state.context.temp).toEqual(220);

    m.send(nEvents('TICK', 10));
    expect(m.state.value).toEqual({ started: 'paused' });
    expect(m.state.context.temp).toEqual(230);

    m.stop();
  });
});

describe('belt', () => {
  test('should keep the oven heated when started and then paused', () => {
    const m = interpret(bizkitMachine);
    m.start();

    m.send(TURN_ON_EVENT);
    expect(m.state.value).toEqual({ started: 'heating_up' });
    expect(m.state.context.temp).toEqual(20);

    m.send(nEvents('TICK', 200));
    expect(m.state.value).toEqual({ started: 'running' });
    expect(m.state.context.temp).toEqual(220);
    expect(m.state.context.belt).toEqual([
      { id: 0, position: 0, cookLevel: 0, type: 'dough' },
    ]);
    expect(m.state.context.basket).toEqual([]);

    m.send(nEvents('TICK', 10));
    expect(m.state.context.temp).toEqual(230);
    expect(m.state.context.belt).toEqual([
      { id: 1, position: 0, cookLevel: 0, type: 'dough' },
      { id: 0, position: 10, cookLevel: 0, type: 'biscuit' },
    ]);
    expect(m.state.context.basket).toEqual([]);

    m.send(nEvents('TICK', 10));
    expect(m.state.context.temp).toEqual(240);
    expect(m.state.context.belt).toEqual([
      { id: 2, position: 0, cookLevel: 0, type: 'dough' },
      { id: 1, position: 10, cookLevel: 0, type: 'biscuit' },
      { id: 0, position: 20, cookLevel: 0, type: 'biscuit' },
    ]);
    expect(m.state.context.basket).toEqual([]);

    m.send(nEvents('TICK', 10));
    expect(m.state.context.temp).toEqual(235);
    expect(m.state.context.belt).toEqual([
      { id: 3, position: 0, cookLevel: 0, type: 'dough' },
      { id: 2, position: 10, cookLevel: 0, type: 'biscuit' },
      { id: 1, position: 20, cookLevel: 0, type: 'biscuit' },
      { id: 0, position: 30, cookLevel: 0, type: 'biscuit' },
    ]);
    expect(m.state.context.basket).toEqual([]);

    m.send(nEvents('TICK', 10));
    expect(m.state.context.temp).toEqual(230);
    expect(m.state.context.belt).toEqual([
      { id: 4, position: 0, cookLevel: 0, type: 'dough' },
      { id: 3, position: 10, cookLevel: 0, type: 'biscuit' },
      { id: 2, position: 20, cookLevel: 0, type: 'biscuit' },
      { id: 1, position: 30, cookLevel: 0, type: 'biscuit' },
      { id: 0, position: 40, cookLevel: 10, type: 'biscuit' },
    ]);
    expect(m.state.context.basket).toEqual([]);

    m.send(nEvents('TICK', 5));
    expect(m.state.context.temp).toEqual(227.5);
    expect(m.state.context.belt).toEqual([
      { id: 4, position: 5, cookLevel: 0, type: 'dough' },
      { id: 3, position: 15, cookLevel: 0, type: 'biscuit' },
      { id: 2, position: 25, cookLevel: 0, type: 'biscuit' },
      { id: 1, position: 35, cookLevel: 5, type: 'biscuit' },
      { id: 0, position: 45, cookLevel: 10, type: 'biscuit' },
    ]);
    expect(m.state.context.basket).toEqual([]);

    m.send(PAUSED_EVENT);
    m.send(nEvents('TICK', 70));
    expect(m.state.context.temp).toEqual(222.5);
    expect(m.state.context.belt).toEqual([
      { id: 4, position: 5, cookLevel: 0, type: 'dough' },
      { id: 3, position: 15, cookLevel: 0, type: 'biscuit' },
      { id: 2, position: 25, cookLevel: 0, type: 'biscuit' },
      { id: 1, position: 35, cookLevel: 75, type: 'biscuit' },
      { id: 0, position: 45, cookLevel: 10, type: 'biscuit' },
    ]);
    expect(m.state.context.basket).toEqual([]);

    m.send(TURN_ON_EVENT);
    m.send(nEvents('TICK', 15));
    expect(m.state.context.temp).toEqual(230);
    expect(m.state.context.belt).toEqual([
      { id: 6, position: 0, cookLevel: 0, type: 'dough' },
      { id: 5, position: 10, cookLevel: 0, type: 'biscuit' },
      { id: 4, position: 20, cookLevel: 0, type: 'biscuit' },
      { id: 3, position: 30, cookLevel: 0, type: 'biscuit' },
      { id: 2, position: 40, cookLevel: 10, type: 'biscuit' },
      { id: 1, position: 50, cookLevel: 80, type: 'biscuit' },
    ]);
    expect(m.state.context.basket).toEqual([
      { id: 0, type: 'biscuit', cookLevel: 10 },
    ]);

    m.stop();
  });

  test('should keep the oven heated when started and then paused', () => {
    const m = interpret(bizkitMachine);
    m.start();

    m.send(TURN_ON_EVENT);
    expect(m.state.value).toEqual({ started: 'heating_up' });
    expect(m.state.context.temp).toEqual(20);

    m.send(nEvents('TICK', 200));
    expect(m.state.value).toEqual({ started: 'running' });
    expect(m.state.context.temp).toEqual(220);
    expect(m.state.context.belt).toEqual([
      { id: 0, position: 0, cookLevel: 0, type: 'dough' },
    ]);
    expect(m.state.context.basket).toEqual([]);

    m.send(nEvents('TICK', 10));
    expect(m.state.context.temp).toEqual(230);
    expect(m.state.context.belt).toEqual([
      { id: 1, position: 0, cookLevel: 0, type: 'dough' },
      { id: 0, position: 10, cookLevel: 0, type: 'biscuit' },
    ]);
    expect(m.state.context.basket).toEqual([]);

    m.send(nEvents('TICK', 10));
    expect(m.state.context.temp).toEqual(240);
    expect(m.state.context.belt).toEqual([
      { id: 2, position: 0, cookLevel: 0, type: 'dough' },
      { id: 1, position: 10, cookLevel: 0, type: 'biscuit' },
      { id: 0, position: 20, cookLevel: 0, type: 'biscuit' },
    ]);
    expect(m.state.context.basket).toEqual([]);

    m.send(nEvents('TICK', 10));
    expect(m.state.context.temp).toEqual(235);
    expect(m.state.context.belt).toEqual([
      { id: 3, position: 0, cookLevel: 0, type: 'dough' },
      { id: 2, position: 10, cookLevel: 0, type: 'biscuit' },
      { id: 1, position: 20, cookLevel: 0, type: 'biscuit' },
      { id: 0, position: 30, cookLevel: 0, type: 'biscuit' },
    ]);
    expect(m.state.context.basket).toEqual([]);

    m.send(nEvents('TICK', 10));
    expect(m.state.context.temp).toEqual(230);
    expect(m.state.context.belt).toEqual([
      { id: 4, position: 0, cookLevel: 0, type: 'dough' },
      { id: 3, position: 10, cookLevel: 0, type: 'biscuit' },
      { id: 2, position: 20, cookLevel: 0, type: 'biscuit' },
      { id: 1, position: 30, cookLevel: 0, type: 'biscuit' },
      { id: 0, position: 40, cookLevel: 10, type: 'biscuit' },
    ]);
    expect(m.state.context.basket).toEqual([]);

    m.send(nEvents('TICK', 10));
    expect(m.state.context.temp).toEqual(225);
    expect(m.state.context.belt).toEqual([
      { id: 5, position: 0, cookLevel: 0, type: 'dough' },
      { id: 4, position: 10, cookLevel: 0, type: 'biscuit' },
      { id: 3, position: 20, cookLevel: 0, type: 'biscuit' },
      { id: 2, position: 30, cookLevel: 0, type: 'biscuit' },
      { id: 1, position: 40, cookLevel: 10, type: 'biscuit' },
      { id: 0, position: 50, cookLevel: 10, type: 'biscuit' },
    ]);
    expect(m.state.context.basket).toEqual([]);

    m.send(nEvents('TICK', 10));
    expect(m.state.context.temp).toEqual(220);
    expect(m.state.context.belt).toEqual([
      { id: 6, position: 0, cookLevel: 0, type: 'dough' },
      { id: 5, position: 10, cookLevel: 0, type: 'biscuit' },
      { id: 4, position: 20, cookLevel: 0, type: 'biscuit' },
      { id: 3, position: 30, cookLevel: 0, type: 'biscuit' },
      { id: 2, position: 40, cookLevel: 10, type: 'biscuit' },
      { id: 1, position: 50, cookLevel: 10, type: 'biscuit' },
    ]);
    expect(m.state.context.basket).toEqual([
      { id: 0, type: 'biscuit', cookLevel: 10 },
    ]);

    m.stop();
  });
});
