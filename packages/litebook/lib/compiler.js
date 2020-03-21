const webpack = require("webpack");
const webpackDevServer = require('webpack-dev-server');
const onExit = require('exit-hook');

const formatStats = require("./formatStats.js");
const log = require("./log");

function serve(config, context) {
  // force silence
  webpackDevServer.prototype.showStatus = function () {}

  webpackDevServer.addDevServerEntrypoints(config, config.devServer);

  const compiler = webpack(config);

  compiler.hooks.watchRun.tap('stats', () => {
    // log('compiling', 'gray');
  });

  compiler.hooks.afterEmit.tap('stats', comp => {
    const formatted = formatStats(comp.getStats());
    const { errors, warnings, assets } = formatted[0];

    if (errors.length || warnings.length) {
      errors.map(err => log('\n' + err + '\n', 'red'));
      warnings.map(err => log('\n' + err + '\n', 'yellow'));
    } else {
      log('compiled', 'green');
    }
  });

  const server = new webpackDevServer(compiler, config.devServer);
  server.listen(context.port);

  onExit(() => {
    server.close();
  });

  return true;
}

function watch(configs) {
  const events = {};

  function emit(event, data) {
    (events[event] || []).map(cb => cb(data));
  }

  const compiler = webpack(configs).watch({}, (e, stats) => {
    const formatted = formatStats(stats);

    if (e) {
      log('\n' + e + '\n', 'red');
    }

    emit('stats', formatted);
  });

  return {
    on(event, cb) {
      events[event] = (events[event] || []).concat(cb);
      return () => {
        events[event].splice(events[event].indexOf(cb), 1);
      };
    },
    close() {
      return new Promise(r => compiler.close(r));
    }
  };
}

function build(configs) {
  return new Promise((res, rej) => {
    webpack(configs).run((e, stats) => {
      if (e) rej(e);
      res(formatStats(stats));
    });
  });
}

module.exports = {
  build,
  watch,
  serve,
};
