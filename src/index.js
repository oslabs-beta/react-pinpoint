const uniqueRandomArray = require('unique-random-array');
const ourNames = require('./names.json');
const ReactPinpoint = require('./utils/utils');

module.exports = {
  all: ourNames,
  random: uniqueRandomArray(ourNames),
  ReactPinpoint,
};
