const uniqueRandomArray = require('unique-random-array');
const ourNames = require('./names.json');

module.exports = {
  all: ourNames,
  random: uniqueRandomArray(ourNames),
};
