const BizkitMachine = require("..");
const { assign, createMachine, interpret } = require("xstate");
const { SimulatedClock } = require("xstate/lib/SimulatedClock");

const RED_STATE = "red";
const GREEN_STATE = "green";
const TOGGLE_ACTION = "TOGGLE";

const timerMachine = createMachine({
  initial: "running",
  context: {
    elapsed: 0,
    duration: 2,
    interval: 0.5,
  },
  states: {
    running: {
      invoke: {
        src: (context) => (cb) => {
          const interval = setInterval(() => {
            cb("TICK");
          }, 1000 * context.interval);

          return () => {
            clearInterval(interval);
          };
        },
      },
      on: {
        always: {
          target: "paused",
          cond: (context) => {
            console.log("checking condition");
            return context.elapsed >= context.duration;
          },
        },
        TICK: {
          actions: assign({
            elapsed: (context) => {
              console.log("TICK", context.elapsed);
              return +(context.elapsed + context.interval).toFixed(2);
            },
          }),
        },
      },
    },
    paused: {
      on: {
        always: {
          target: "running",
          cond: (context) => context.elapsed < context.duration,
        },
      },
    },
  },
  on: {
    "DURATION.UPDATE": {
      actions: assign({
        duration: (_, event) => event.value,
      }),
    },
    RESET: {
      actions: assign({
        elapsed: 0,
      }),
    },
  },
});


test("foo", async () => {
  const clock = new SimulatedClock();
  const tm = interpret(timerMachine, { clock });
  tm.subscribe((state) => console.log("FOO", state));

  // clock.start(1)
  tm.start();
  // clock.increment(1200)
  clock.setTimeout(() => console.log("sm"), 100);

  clock.increment(2000);
  // const p = new Promise((r) => setTimeout(r, 2100));

  clock.increment(2200);
  // await p;
  tm.stop();
  console.log(tm.state.context.elapsed);
});
