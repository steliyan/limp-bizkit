const React = require('react');
const { Box, Text } = require('ink');

const EXTRUDER_LABEL = 'POOPER';

const Extruder = () => (
  <Box
    width={3}
    height={EXTRUDER_LABEL + 2}
    borderColor="blue"
    borderStyle="bold"
    flexDirection="column"
  >
    <Text>{EXTRUDER_LABEL}</Text>
  </Box>
);

module.exports = {
  Extruder,
};
