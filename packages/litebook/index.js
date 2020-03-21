const path = require("path");
const matched = require("matched");
const chokidar = require("chokidar");
const junk = require("junk");
const onExit = require("exit-hook");
const mm = require("micromatch");
const exit = require('exit');

const { createStoryConfigs, createAppConfig } = require("./lib/config");
const { createApp, createIndex } = require("./lib/scripts");
const { build, watch, serve } = require("./lib/compiler");
const { assert, getAssetId, getFile } = require("./lib/utils");
const log = require("./lib/log");

let applicationServer;
const root = __dirname;
const cwd = process.cwd();
const tempDir = path.join(__dirname, "__temp");

module.exports = async function create({
  source: cliSource,
  watch: cliWatch,
  config: cliConfig,
  output,
  port,
  theme
}) {
  const config = getFile(cliConfig, cwd);

  const source = config.source || cliSource;
  assert(source, "config - please provide a source", true);
  const publicDir = path.join(cwd, config.output || output ||  "litebook");
  const sourceFiles = (await matched(source, { cwd, nodir: true })).map(f =>
    path.resolve(cwd, f)
  );
  const sourceDir = path.resolve(
    cwd,
    source
      .split(path.sep)
      .reverse()
      .filter(p => !/\*/.test(p))
      .reverse()
      .join(path.sep)
  );

  const context = {
    root,
    cwd,
    tempDir,
    publicDir,
    sourceDir,
    sourceFiles,
    watch: cliWatch,
    port: config.port || port || 5000,
    theme: config.theme || theme || '@litebook/theme',
    webpack: config.webpack
  };

  const configs = createStoryConfigs(context);

  if (cliWatch) {
    if (!applicationServer) log(`litebook - watch - http://localhost:${context.port}`, "blue");
    log("compiling", "gray");

    const compiler = watch(configs);

    let stats = [];

    compiler.on("stats", nextStats => {
      // merge new stats objects
      for (let i = 0; i < nextStats.length; i++) {
        const nstat = nextStats[i];

        if (
          stats.find(pstat => {
            return getAssetId(pstat) === getAssetId(nstat);
          })
        ) {
          stats.splice(i, 1, nstat);
        } else {
          stats.push(nstat);
        }
      }

      createApp(stats, context);
      createIndex(stats, context);

      stats.forEach(stat => {
        stat.errors.map(err => log("\n" + err + "\n", "red"));
        stat.warnings.map(err => log("\n" + err + "\n", "yellow"));
      });

      if (!applicationServer) {
        applicationServer = serve({
          ...createAppConfig(context), // won't be updated on re-create
          entry: path.join(tempDir, "index.js"),
          devServer: {
            contentBase: publicDir,
            quiet: true,
            noInfo: true,
            historyApiFallback: true,
            hot: true
          }
        }, context);
      }
    });

    const watcher = chokidar
      .watch(sourceDir, {
        persistent: true,
        ignoreInitial: true,
        ignore: [] // TODO
      })
      .on("all", (event, path) => {
        if (!path) return;

        if (!mm.contains(path, [source])) return; // TODO limit to source glob
        if (junk.is(path)) return;

        log("compiling", "gray");

        if (/add|unlink/.test(event)) {
          compiler.close();
          watcher.close();
          create(source, { watch: cliWatch });

          if (event === "add") {
            log(`adding ${path}`, "gray");
          } else {
            log(`removing ${path}`, "gray");
          }
        }
      });

    onExit(() => {
      compiler.close();
      watcher.close();
    });
  } else {
    log(`litebook - build - /${output}`, "blue");
    log('building', 'gray');

    const stats = await build(configs);

    createApp(stats, context);
    createIndex(stats, context);

    await build([createAppConfig(context)]);

    log('done', 'green');
    exit();
  }
};
