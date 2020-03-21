const stickylog = require('stickylog');
const c = require('ansi-colors');

let state = {
  ready: false,
  url: '',
  recompiling: false,
  watch: false,
  messages: []
}

function log() {
  const { ready, url, recompiling, watch, messages } = state

  const bannerRow = `\n${c.blue('storybook')} ${c.gray(watch ? 'watch' : 'build')}`
  const readyRow = ready ? `\n\n${c.gray('ready')} ${url}` : '';
  const compilingRow = `\n\n${recompiling ? c.magenta('recompiling') : c.green('compiled')}`;

  stickylog(`${bannerRow}${readyRow}${compilingRow}`,
    messages.join('\n\n') + '\n'
  )
}

function setState(s) {
  Object.assign(state, s);
  log();
}

function error(msg) {
  state.messages.push(c.red(msg))
  log();
}

function warn(msg) {
  state.messages.push(c.yellow(msg))
  log();
}

function info(msg) {
  state.messages.push(c.gray(msg))
  log();
}

function debug(msg) {
  state.messages.push(msg)
  log();
}

module.exports = {
  setState,
  error,
  warn,
  info,
  debug,
}
