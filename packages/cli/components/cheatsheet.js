const React = require('react');
const { Box, Text } = require('ink');
const { Shortcut } = require('import-jsx')('./shortcut');

const Cheatsheet = () => (
  <Box borderStyle="round" flexDirection="column">
    <Box marginTop={-1} marginLeft={1}>
      <Text>CHEATSHEET</Text>
    </Box>

    <Box flexDirection="row" paddingX={2} paddingY={1}>
      <Box flexDirection="column" width={'30%'}>
        <Text bold>Machine</Text>
        <Shortcut char={'o'} description={'on'} />
        <Shortcut char={'p'} description={'pause'} />
        <Shortcut char={'['} description={'off'} />
      </Box>
      <Box flexDirection="column" width={'30%'}>
        <Text bold>Simulation</Text>
        <Shortcut char={','} description={'freeze'} />
        <Shortcut char={'.'} description={'next tick'} />
      </Box>
      <Box flexDirection="column" width={'40%'} alignItems="flex-end">
        <Shortcut char={'q'} description={'quit'} />
      </Box>
    </Box>
  </Box>
);

module.exports = {
  Cheatsheet,
};
