const React = require('react');
const chalk = require('chalk');
const { Box, Text } = require('ink');
const { WIDTH, TOTAL_WIDTH } = require('../constants');

const colors = [
  { cookLevel: 15, color: '#000000' },
  { cookLevel: 12, color: '#3D251E' },
  { cookLevel: 9, color: '#4C3228' },
  { cookLevel: 7, color: '#5B3E31' },
  { cookLevel: 5, color: '#5A4A3A' },
  { cookLevel: 4, color: '#765341' },
  { cookLevel: 3, color: '#8B6C5C' },
  { cookLevel: 2, color: '#A08679' },
  { cookLevel: 1, color: '#D8CBC4' },
  { cookLevel: 0, color: '#FFFFFF' },
];

const getColor = ({ cookLevel }) =>
  colors.find((c) => c.cookLevel <= cookLevel).color;

const getItemTypeChar = ({ type }) => {
  if (type === 'dough') {
    return 'x';
  }

  return 'o';
};

const getBeltItem = (items, pos) => {
  const item = items.find(({ position }) => position === pos);
  if (!item) {
    return '-';
  }

  const color = getColor(item);
  const itemChar = getItemTypeChar(item);
  return chalk.hex(color)(itemChar);
};

const getBelt = (items) => {
  let result = '';
  for (let pos = 0; pos < WIDTH; pos++) {
    result += getBeltItem(items, pos);
  }

  return result;
};

const Belt = ({ items, total }) => {
  const belt = React.useMemo(() => getBelt(items), [items]);

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
        <Text>{total} IN TOTAL</Text>
      </Box>
    </Box>
  );
};

module.exports = {
  Belt,
};
