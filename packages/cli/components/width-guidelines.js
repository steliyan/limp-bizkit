const React = require('react');
const { Text, Newline } = require('ink');

const { X_OFFSET, WIDTH } = require('../constants');

const GUIDELINE_X_OFFSET = '+'.repeat(X_OFFSET);

const GUIDELINE_GROUP_COUNT = Math.floor(WIDTH / 10 + 1);

const DIGIT_GUIDELINE = '0123456789'
  .repeat(GUIDELINE_GROUP_COUNT)
  .substring(0, WIDTH);

const TENTH_GUIDELINE = new Array(GUIDELINE_GROUP_COUNT)
  .fill(0)
  .reduce((result, _, index) => {
    return result + (index * 10).toString().padStart(2, '0') + '-'.repeat(8);
  }, '')
  .substring(0, WIDTH);

const WidthGuidelines = () => (
  <Text>
    <Text>
      {GUIDELINE_X_OFFSET}
      {DIGIT_GUIDELINE}
      {GUIDELINE_X_OFFSET}
    </Text>

    <Newline />

    <Text>
      <Text>{GUIDELINE_X_OFFSET}</Text>
      <Text>{TENTH_GUIDELINE}</Text>
      <Text>{GUIDELINE_X_OFFSET}</Text>
    </Text>
  </Text>
);

module.exports = {
  WidthGuidelines,
};
