const fs = require('fs');

module.exports = function readGeojson(filename) {
  try {
    return JSON.parse(fs.readFileSync(filename));
  } catch (error) {
    throw new Error(`Could not read input file: ${error.message}`);
  }
};
