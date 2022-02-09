const { actions, createMachine, assign } = require('xstate');

const AMBIENT_TEMP = 20;
const LO_TEMP_THRESHOLD = 220;
const HI_TEMP_THRESHOLD = 240;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const clampTemp = (temp) => clamp(temp, AMBIENT_TEMP, HI_TEMP_THRESHOLD);

const turnHeaterOn = ({ temp, prevTemp, maintainTemp }) => {
  if (!maintainTemp) {
    return false;
  }

  if (temp <= LO_TEMP_THRESHOLD) {
    return true;
  }

  if (temp >= HI_TEMP_THRESHOLD) {
    return false;
  }

  return temp >= prevTemp;
};

const STARTED_STATE = 'started';
const RUNNING_STATE = 'running';
const HEATING_UP_STATE = 'heating_up';
const PAUSED_STATE = 'paused';

const STOPPED_STATE = 'stopped';
const CLEANING_BELT_STATE = 'cleaning_belt';
const FULLY_STOPPED_STATE = 'fully_stopped';

const TURN_ON_EVENT = 'turn_on';
const TURN_OFF_EVENT = 'turn_off';
const PAUSED_EVENT = 'paused';

// Belt implementation
// 00 10 20 30 40 50
// EE SS __ OO OO __
// EE - extruded
// SS - stamper
// __ - nothing
// OO - oven

const EXTRUDER_POSITION = 0;
const STAMPER_POSITION = 10;
const OVEN_POSITION = 30;
const OVEN_WIDTH = 10;
const WIDTH = 50;

const { choose, raise } = actions;

const bizkitMachine = createMachine(
  {
    initial: STOPPED_STATE,
    context: {
      cookieId: 0,
      ticks: 0,
      maintainTemp: false,
      temp: AMBIENT_TEMP,
      prevTemp: undefined,
      belt: [],
      basket: [],
    },
    states: {
      [STOPPED_STATE]: {
        initial: FULLY_STOPPED_STATE,
        states: {
          [CLEANING_BELT_STATE]: {
            always: {
              cond: ({ belt }) => !belt.length,
              target: FULLY_STOPPED_STATE,
            },
            on: {
              _TICK: {
                actions: ['rollBelt'],
              },
            },
          },
          [FULLY_STOPPED_STATE]: {
            always: {
              cond: ({ belt }) => belt.length,
              target: CLEANING_BELT_STATE,
            },
          },
        },
        on: {
          [TURN_ON_EVENT]: STARTED_STATE,
        },
      },
      [STARTED_STATE]: {
        initial: RUNNING_STATE,
        entry: assign({ maintainTemp: true }),
        exit: assign({ maintainTemp: false }),
        states: {
          [HEATING_UP_STATE]: {
            always: {
              cond: ({ temp }) => temp >= LO_TEMP_THRESHOLD,
              target: RUNNING_STATE,
            },
            on: {
              [PAUSED_EVENT]: PAUSED_STATE,
            },
          },
          [RUNNING_STATE]: {
            always: {
              target: HEATING_UP_STATE,
              cond: ({ temp }) => temp < LO_TEMP_THRESHOLD,
            },
            on: {
              [PAUSED_EVENT]: PAUSED_STATE,
              ['_TICK']: {
                actions: ['rollBelt'],
              },
              ['_10TICKS']: {
                actions: choose([
                  {
                    cond: ({ temp }) => {
                      return temp >= LO_TEMP_THRESHOLD;
                    },
                    actions: ['extrudeDough', 'stampBiscuit'],
                  },
                ]),
              },
            },
          },
          [PAUSED_STATE]: {
            on: {
              [TURN_ON_EVENT]: RUNNING_STATE,
            },
          },
        },
      },
    },
    on: {
      [TURN_ON_EVENT]: STARTED_STATE,
      [TURN_OFF_EVENT]: STOPPED_STATE,
      TICK: {
        actions: [
          assign({
            ticks: ({ ticks }) => (ticks + 1) % 10,
          }),
          raise({ type: '_TICK' }),
          choose([
            {
              cond: ({ ticks }) => ticks % 10 === 0,
              actions: raise({ type: '_10TICKS' }),
            },
          ]),
          'changeTemp',
          'bakeCookies',
        ],
      },
    },
  },
  {
    actions: {
      changeTemp: assign({
        temp: (ctx) => {
          const { temp } = ctx;
          const newTemp = turnHeaterOn(ctx) ? temp + 1 : temp - 0.5;
          return clampTemp(newTemp);
        },
        prevTemp: ({ temp }) => temp,
      }),
      extrudeDough: assign({
        cookieId: ({ cookieId }) => cookieId + 1,
        belt: ({ belt, cookieId }) => [
          {
            id: cookieId,
            type: 'dough',
            position: EXTRUDER_POSITION,
            cookLevel: 0,
          },
          ...belt,
        ],
      }),
      stampBiscuit: assign({
        belt: ({ belt }) => {
          return belt.map((item) => {
            if (item.position === STAMPER_POSITION && item.type === 'dough') {
              return { ...item, type: 'biscuit' };
            }

            return item;
          });
        },
      }),
      bakeCookies: assign({
        belt: ({ belt }) => {
          return belt.map((item) => {
            if (
              item.position >= OVEN_POSITION &&
              item.position < OVEN_POSITION + OVEN_WIDTH
            ) {
              return { ...item, cookLevel: item.cookLevel + 1 };
            }

            return item;
          });
        },
      }),
      rollBelt: assign({
        basket: ({ belt, basket }) => [
          ...belt
            .filter(({ position }) => position >= WIDTH - 1)
            // eslint-disable-next-line no-unused-vars
            .map(({ position, ...rest }) => rest),
          ...basket,
        ],
        belt: ({ belt }) =>
          belt
            .map(({ position, ...rest }) => ({
              ...rest,
              position: position + 1,
            }))
            .filter(({ position }) => position < WIDTH),
      }),
    },
  }
);

module.exports = {
  bizkitMachine,
  TURN_ON_EVENT,
  TURN_OFF_EVENT,
  PAUSED_EVENT,
  TICK_EVENT,
  EXTRUDER_POSITION,
  STAMPER_POSITION,
  OVEN_POSITION,
  OVEN_WIDTH,
};
