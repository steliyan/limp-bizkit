'use strict';
const React = require('react');
const { render, useInput, useApp, Box, Text, Spacer } = require('ink');
const { useInterpret, useSelector } = require('@xstate/react');
const {
  bizkitMachine,
  TURN_ON_EVENT,
  TURN_OFF_EVENT,
  PAUSED_EVENT,
  TICK_EVENT,
  EXTRUDER_POSITION,
  STAMPER_POSITION,
  OVEN_POSITION,
  OVEN_WIDTH,
} = require('bizkit-machine/bizkit');

const { TOTAL_WIDTH } = require('./constants');
const { Extruder } = require('import-jsx')('./components/extruder');
const { Stamper } = require('import-jsx')('./components/stamper');
const { Oven } = require('import-jsx')('./components/oven');
const { Cheatsheet } = require('import-jsx')('./components/cheatsheet');
const { Belt } = require('import-jsx')('./components/belt');
const { WidthGuidelines } = require('import-jsx')(
  './components/width-guidelines'
);

const ON_KEY = 'o';
const PAUSE_KEY = 'p';
const OFF_KEY = '[';
const FREEZE_KEY = ',';
const NEXT_TICK_KEY = '.';
const QUIT_KEY = 'q';

const selectTemp = (state) => state.context.temp;
const selectBelt = (state) => state.context.belt;
const selectTotal = (state) => state.context.basket.length;
const selectState = (state) => state.value;

const formatState = (state) => {
  if (state.stopped) {
    return <Text color="red">TURNED OFF</Text>;
  }

  if (state.started === 'paused') {
    return <Text color="yellow">PAUSED</Text>;
  }

  return <Text color="green">TURNED ON</Text>;
};

const Bizkit = () => {
  const { exit } = useApp();
  const [simulate, setSimulate] = React.useState(false);
  const [ticks, setTicks] = React.useState(0);

  const service = useInterpret(() => bizkitMachine);
  const state = useSelector(service, selectState);
  const temp = useSelector(service, selectTemp);
  const belt = useSelector(service, selectBelt);
  const total = useSelector(service, selectTotal);

  React.useEffect(() => {
    if (!simulate) {
      return;
    }

    const timer = setInterval(
      () => setTicks((prevTicks) => prevTicks + 1),
      100
    );

    return () => clearInterval(timer);
  }, [simulate]);

  React.useEffect(() => service.send(TICK_EVENT), [ticks]);

  useInput((input) => {
    if (input === QUIT_KEY) {
      return exit();
    }

    if (input === FREEZE_KEY) {
      return setSimulate((prev) => !prev);
    }

    if (input === NEXT_TICK_KEY) {
      return !simulate && setTicks((prevTicks) => prevTicks + 1);
    }

    if (input === ON_KEY) {
      if (!simulate) {
        setSimulate(true);
      }

      return service.send(TURN_ON_EVENT);
    }

    if (input === OFF_KEY) {
      return service.send(TURN_OFF_EVENT);
    }

    if (input === PAUSE_KEY) {
      return service.send(PAUSED_EVENT);
    }
  });

  return (
    <>
      {/* eslint-disable-next-line no-undef */}
      {process.env.DEBUG && <WidthGuidelines />}

      <Box
        width={TOTAL_WIDTH}
        borderColor="green"
        borderStyle="round"
        flexDirection="column"
      >
        <Box marginTop={-1} marginX={1} alignItems="space-between">
          <Box>
            <Text>LIMP BIZKIT ({formatState(state)})</Text>
          </Box>

          <Spacer />

          <Box>
            <Spacer />
            <Text color={simulate ? 'green' : 'red'}>{ticks} TICKS</Text>
          </Box>
        </Box>

        <Box>
          <Box paddingLeft={EXTRUDER_POSITION}>
            <Extruder />
          </Box>

          <Box
            marginLeft={-3 - EXTRUDER_POSITION}
            paddingLeft={STAMPER_POSITION}
          >
            <Stamper />
          </Box>

          <Box
            marginLeft={-3 - STAMPER_POSITION}
            paddingTop={3}
            paddingLeft={OVEN_POSITION}
          >
            <Oven temp={temp} width={OVEN_WIDTH} />
          </Box>
        </Box>

        <Box>
          <Belt items={belt} total={total} />
        </Box>

        <Cheatsheet />
      </Box>
    </>
  );
};

render(<Bizkit />);
