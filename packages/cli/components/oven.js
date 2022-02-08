const React = require('react');
const { Box, Text } = require('ink');

const Oven = ({ temp }) => (
  <Box
    width={12}
    height={5}
    flexDirection="column"
    alignItems="center"
    borderStyle="doubleSingle"
    borderColor="red"
  >
    <Text>OVEN</Text>
    <Text>{temp.toString().padStart(3, ' ')}C</Text>
  </Box>
);

module.exports = {
  Oven,
};
