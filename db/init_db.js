const { client } = require('./');
const {
  rebuildDB,
  testDB
} = require('./seed_data');

/**
 * Do not change this code!
 */
client.connect()
  .then(rebuildDB)
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());