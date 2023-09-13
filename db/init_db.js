const { client } = require("./");
const { rebuildDB, testDB } = require("./seed_data");

client
  .connect()
  .then(rebuildDB)
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
