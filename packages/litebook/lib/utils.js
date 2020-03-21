const path = require('path');
const exit = require('exit');

const log = require("./log");

function getAssetId(stat) {
  const asset = stat.assets[0];
  return path.join(asset.outputPath, asset.name);
}

function getFile(path) {
  try {
    return require(path);
  } catch (e) {
    return {};
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
