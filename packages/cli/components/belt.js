const React = require('react');
const { Box, Text } = require('ink');

const { WIDTH, TOTAL_WIDTH } = require('../constants');

const BELT_TEMPLATE = '-'.repeat(WIDTH);

const replaceCharAt = (str, pos, char) =>
  str.substring(0, pos) + char + str.substring(pos + 1);

const getItemTypeChar = (type) => 'x';

const getBelt = (items) =>
  items.reduce(
    (belt, { type, position }) =>
      replaceCharAt(belt, position, getItemTypeChar(type)),
    BELT_TEMPLATE
  );

const Belt = ({ count = 5 }) => {
  const belt = React.useMemo(() => getBelt([{ position: 2 }]), []);

  return (
    <Box flexDirection="column" width={TOTAL_WIDTH}>
      <Box paddingX={1}>
        <Text>{belt}</Text>
      </Box>
      <Box
        width="100%"
        justifyContent="flex-end"
        paddingX={1}
        borderStyle="round"
      >
        <Text>{count} IN TOTAL</Text>
      </Box>
    </Box>
  );
};

module.exports = {
  Belt,
};
