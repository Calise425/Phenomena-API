
exports.shorthands = undefined;

const { client } = require('../');
const {
  rebuildDB,
  testDB
} = require('../seed_data');


exports.up = pgm => {
  client.connect()
  .then(rebuildDB)
  .then(testDB)
  .catch(console.error)
};

exports.down = pgm => {
  client.end();
};