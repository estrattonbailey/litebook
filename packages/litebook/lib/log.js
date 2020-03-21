const c = require('ansi-colors');

module.exports = function log(msg, color) {
  console.log((color ? c[color](msg) : msg));
}
