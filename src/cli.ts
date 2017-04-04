import * as glob from "glob";
import * as fs from "fs";
import * as path from "path";
import * as program from "commander";
import config from "./config";

import {findWatchers} from "witheve";
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
  for(let i = 0; i < kvs.length; i += 2) {
    let key = kvs[i];
    let value = kvs[i + 1];
    if(!value) throw new Error("Must specify a path for every workspace.");
    memo[key] = value;
  }
  return memo;
}

function resolveFile(file:string) {
  return path.resolve(file);
}

program
  .option("-W, --workspace <name> <path>", "Search path(s) for programs", collectKV, config.workspacePaths)
  .option("-L, --library-path <path>", "Search path(s) for watchers", collect, config.watcherPaths)
  .option("-a, --watch", "Watch the active program's file for changes and auto-reload")
  .option("-e, --execute <file>", "Execute a specific Eve program rather than the program browser", resolveFile)

   // Node Eval
  .option("-H, --headless", "Run the specified program in node instead of the browser. Requires -e")

  // Browser Eval
  .option("-p, --port <number>", "Run the Eve server on an alternate port. Default <8000>")
  .option("-n, --no-open", "Don't automatically open Eve in the browser")

  .option("-f, --list-found", "List all programs and watchers found within their search paths")
  .parse(process.argv);

config.fromObject({
  workspacePaths: program["workspace"],
  watcherPaths: program["libraryPath"],
  watch: program["watch"],
  port: program["port"],
  open: program["open"]
});

if(program["execute"]) {
  let file = program["execute"];
  config.setWorkspace("file", path.dirname(file));
  config.file = "file/" + path.basename(file);
}

export function findPrograms(workspacePath:string) {
  let programFiles:string[] = [];
  for(let filepath of glob.sync(workspacePath + "/*.js")) {
    programFiles.push(filepath);
  }
  return programFiles;
}

console.info("For a complete list of Eve's configuration options, run `eve --help`");

if(program["listFound"]) {
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
  console.info("  " + watchers.map((p) => path.relative(config.root, p)).join("\n  "));
  process.exit(0);
}

if(program["headless"]) {
  if(!program["execute"]) {
    program.outputHelp();
    console.error("\nERROR: Unable to run Eve headless unless you specify a program to run with `-e <file>`");
    process.exit(1);
  }

  console.info(`Starting headless Eve instance`);
  require(program["execute"]);

} else {
  let server = new Server();
  server.start();
}
