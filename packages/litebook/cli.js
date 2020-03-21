#! /usr/bin/env node

const pkg = require('./package.json');
const log = require("./lib/log");
const litebook = require('./index.js');

const prog = require("commander")
  .version(pkg.version)
  .option(
    "-i, --source <path>",
    "path to source files",
    "litebook.config.js"
  )
  .option(
    "-c, --config <path>",
    "specify the path to your config file",
    "litebook.config.js"
  )
  .option(
    "-t, --theme <name>",
    // "@litebook/theme"
  )
  .option(
    "-o, --output <path>",
    "output directory",
    "litebook"
  )
  .option(
    "-p, --port <port>",
    "port to serve litebook on",
    "5000"
  );

prog.
  command("watch")
  .action(async source => {
    litebook({
      source,
      watch: true,
      config: prog.config,
      output: prog.output,
      port: prog.port,
      theme: prog.theme,
    });
  });

prog.
  command("build")
  .action(async source => {
    litebook({
      source,
      config: prog.config,
      output: prog.output,
      port: prog.port,
      theme: prog.theme,
    });
  });

if (!process.argv.slice(2).length) {
  prog.outputHelp(txt => {
    console.log(txt);
    return txt;
  });
} else {
  console.clear()
  log("initializing...", "gray");

  prog.parse(process.argv);

  if (prog.debug) {
    process.env.DEBUG = true;
  }
}
