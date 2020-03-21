const path = require('path');
const exit = require('exit');

const log = require("./log");

function getAssetId(stat) {
  const asset = stat.assets[0];
  return path.join(asset.outputPath, asset.name);
}

function getFile(file, dir) {
  try {
    return require(file);
  } catch (e) {
    try {
      return require(path.resolve(dir, file));
    } catch (e) {
      return {};
    }
  }
}

function assert(condition, message, shouldExit) {
  if (!Boolean(condition)) {
    log(message, shouldExit ? 'red' : 'yellow');
    shouldExit && exit();
  }
}

module.exports = {
  assert,
  getAssetId,
  getFile,
}
