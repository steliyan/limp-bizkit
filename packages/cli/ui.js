'use strict';
const React = require('react');
const { render, useInput, useApp, Box, Text, Spacer } = require('ink');

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

const Bizkit = () => {
  const { exit } = useApp();
  const [frozen, setFrozen] = React.useState(false);
  const [ticks, setTicks] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(
      () => !frozen && setTicks((prevTicks) => prevTicks + 1),
      100
    );

    return () => clearInterval(timer);
  }, [frozen]);

  useInput((input) => {
    if (input === QUIT_KEY) {
      return exit();
    }

    if (input === FREEZE_KEY) {
      return setFrozen((prev) => !prev);
    }

    if (input === NEXT_TICK_KEY) {
      return frozen && setTicks((prevTicks) => prevTicks + 1);
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
            <Text>LIMP BIZKIT</Text>
          </Box>

          <Spacer />

          <Box>
            <Spacer />
            <Text color={frozen ? 'red' : 'green'}>{ticks} TICKS</Text>
          </Box>
        </Box>

        <Box>
          <Box paddingLeft={0}>
            <Extruder />
          </Box>

          <Box paddingLeft={5}>
            <Stamper />
          </Box>

          <Box paddingLeft={10} paddingTop={3}>
            <Oven temp={220} />
          </Box>
        </Box>

        <Box>
          <Belt />
        </Box>

        <Cheatsheet />
      </Box>
    </>
  );
};

render(<Bizkit />);
