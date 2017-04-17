#!/usr/bin/env node

import * as glob from "glob";
import * as fs from "fs";
import * as path from "path";
import * as program from "commander";
import config from "./config";

import {findWatchers, findPrograms, posixify} from "./util";
import {Server} from "./server";



//------------------------------------------------------------------------------
// CLI Setup
//------------------------------------------------------------------------------

function collect(val:string, memo:string[]) {
  memo.push(val);
  return memo;
}

function collectKV(raw:string, memo:{[workspace:string]: string}) {
  let cleaned = raw.replace(/,/g, " ").replace(/\s+/, " ");
  let kvs = cleaned.split(" ");
  for(let i = 0; i < kvs.length; i += 1) {
    let [key, value] = kvs[i].split(":");
    if(!value) throw new Error("Must specify a path for every workspace.");
    memo[key] = value;
  }
  return memo;
}

function resolveFile(file:string) {
  return path.resolve(file);
}

program
  .usage("[opts] [file]")
  .option("-W, --workspace <name>:<path>", "Search path(s) for programs", collectKV, config.workspacePaths)
  .option("-I, --include <path>", "Search path(s) for watchers", collect, config.watcherPaths)
  //.option("-a, --watch", "Watch the active program's file for changes and auto-reload") // @TODO: This.

   // Node Eval
  .option("-H, --headless", "Run the specified program in node instead of the browser. Requires a specified file")

  // Browser Eval
  .option("-p, --port <number>", "Run the Eve server on an alternate port. Default <8000>")
  .option("-n, --no-open", "Don't automatically open Eve in the browser")

  .option("-f, --list-found", "List all programs and watchers found within their search paths")
  .parse(process.argv);

let opts = program.opts() as {[key:string]: any};
config.fromObject({
  workspacePaths: opts["workspace"],
  watcherPaths: opts["include"],
  watch: opts["watch"],
  port: opts["port"],
  open: opts["open"]
});

if(program.args.length) {
  if(program.args.length > 1) {
    console.error("Refusing to start multiple programs at once. Consider composing them instead.");
    program.outputHelp();
    process.exit(2);
  }
  let file = path.resolve(program.args[0]);
  config.setWorkspace("file", path.dirname(file));
  config.file = "file/" + path.basename(file);
}

console.info("For a complete list of Eve's configuration options, run `eve --help`");

if(opts["listFound"]) {
  console.info("Found programs:");
  for(let workspaceId in config.workspacePaths) {
    let workspacePath = config.workspacePaths[workspaceId];
    let programs = findPrograms(workspacePath);
    console.info(`  ${workspaceId} (${workspacePath}):`);
    console.info("    " + programs.map((p) => path.relative(workspacePath, p)).join("\n    "));
    console.info();
  }

  let watchers = findWatchers(config.watcherPaths);
  console.info("Found watchers:");
  console.info("  " + watchers.map((p) => posixify(path.relative(config.root, p))).join("\n  "));
  process.exit(0);
}

if(opts["headless"]) {
  if(!config.file) {
    program.outputHelp();
    console.error("\nERROR: Unable to run Eve headless unless you specify a program to run with `<file>`");
    process.exit(1);
  }

  console.info(`Starting headless Eve instance...`);
  console.info("  Requiring watchers from include paths...");

  for(let watcherFile of findWatchers(config.watcherPaths)) {
    require(watcherFile);
  }

  console.info("  Starting program...");

  require(config.file!.replace("file", config.workspacePaths["file"]));

} else {
  let server = new Server();
  server.start();
}
