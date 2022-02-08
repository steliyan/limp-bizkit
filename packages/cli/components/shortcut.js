const React = require('react');
const { Text } = require('ink');

const Shortcut = ({ char, description }) => (
  <Text>
    <Text bold>{char}</Text>
    <Text> - </Text>
    <Text>{description}</Text>
  </Text>
);

module.exports = {
  Shortcut,
};
