const fs = require('fs');
const debug = require('debug')('geojson-to-gtfs');
const jszip = require('jszip');
const toCsv = require('./toCsv');

module.exports = function writeGtfs(data, outputPath, zipCompressionLevel = 1, zipComment = undefined) {
  const zip = new jszip();

  Object.keys(data).forEach(name => {
    const filename = `${name}.txt`;
    zip.file(filename, toCsv(data[name]));
    debug(`Generated ${filename}`);
  });

  zip.generateNodeStream({
    type: 'nodebuffer',
    streamFiles: true,
    compression: zipCompressionLevel > 0 ? 'DEFLATE' : 'STORE',
    compressionOptions: {
        level: zipCompressionLevel
    },
    comment: zipComment,
  })
    .pipe(fs.createWriteStream(outputPath))
    .on('finish', () => {
      debug(`Finished writing ${outputPath}`);
    })
    .on('error', (error) => {
      throw error;
    });
};
