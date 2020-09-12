const { client } = require('./');
const {
  rebuildDB,
  testDB
} = require('./seedData');

/**
 * Do not change this code!
 */
rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());