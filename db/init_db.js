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
  .then(https://github.com/jdmann/UNIV_Phenomena_Starter)
  .catch(console.error)
  .finally(() => client.end());