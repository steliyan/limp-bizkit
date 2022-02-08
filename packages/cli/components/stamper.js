const React = require('react');
const { Box, Text } = require('ink');

const STAMPER_LABEL = 'STAMPER';

const Stamper = () => (
  <Box
    width={3}
    height={STAMPER_LABEL.length + 2}
    borderColor="blue"
    borderStyle="bold"
    flexDirection="column"
  >
    <Text>{STAMPER_LABEL}</Text>
  </Box>
);

module.exports = {
  Stamper,
};
