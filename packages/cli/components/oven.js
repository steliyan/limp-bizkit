const React = require('react');
const { Box, Text } = require('ink');

const colors = [
  { temp: 230, color: '#F00505' },
  { temp: 220, color: '#FF2C05' },
  { temp: 200, color: '#FD6104' },
  { temp: 150, color: '#FD9A01' },
  { temp: 100, color: '#FFCE03' },
  { temp: 50, color: '#FEF001' },
  { temp: 0, color: 'white' },
];

const getColor = (temp) => colors.find((c) => c.temp <= temp).color;

const Oven = ({ temp, width }) => (
  <Box
    width={width + 2}
    height={5}
    flexDirection="column"
    alignItems="center"
    borderStyle="doubleSingle"
    borderColor={getColor(temp)}
  >
    <Text>OVEN</Text>
    <Text>{temp.toFixed().toString().padStart(3, ' ')}C</Text>
  </Box>
);

module.exports = {
  Oven,
};
