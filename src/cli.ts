import * as glob from "glob";
import * as fs from "fs";
import * as path from "path";
import * as program from "commander";

import {findWatchers, watcherPath as eveWatcherPath} from "witheve";
import {Server} from "./server";

let _posixifyRegExp = new RegExp("\\\\", "g");
function posixify(path:string) {
  return path.replace(_posixifyRegExp, "/");
}

// @NOTE: If you move this file in the hiararchy, you'll want to adjust this.
let root = posixify(path.resolve(__dirname + "/../.."));
// @NOTE: If you add more TS-compiled folders at the level of src, you'll want to adjust this.
let srcPath = root + "/build/src";

let workspacePaths:{[workspace:string]: string} = {eve: srcPath + "/programs"};
let watcherPaths = [root + "build/watchers", posixify(path.join(root, "node_modules/witheve", eveWatcherPath))];

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
  .option("-W, --workspace <name> <path>", "Search path(s) for programs", collectKV, workspacePaths)
  .option("-L, --library-path <path>", "Search path(s) for watchers", collect, watcherPaths)
  .option("-a, --watch", "Watch the active program's file for changes and auto-reload")
  .option("-e, --execute <file>", "Execute a specific Eve program rather than the program browser", resolveFile)

   // Node Eval
  .option("-H, --headless", "Run the specified program in node instead of the browser. Requires -e")

  // Browser Eval
  .option("-p, --port <number>", "Run the Eve server on an alternate port. Default <8000>")
  .option("-n, --no-open", "Don't automatically open Eve in the browser")

  .option("-f, --list-found", "List all programs and watchers found within their search paths")
  .parse(process.argv);

program["port"] = program["port"] || 8000;

program["root"] = root;
program["workspacePaths"] = workspacePaths;

if(program["execute"]) {
  let file = program["execute"];
  workspacePaths["file"] = path.dirname(file);
  program["file"] = "file/" + path.basename(file);
}

export function findPrograms(workspacePath:string) {
  let programFiles:string[] = [];
  // @NOTE: We normalize backslash to forward slash to make glob happy.
  for(let filepath of glob.sync(posixify(workspacePath) + "/*.js")) {
    if(filepath === __filename) continue;
    programFiles.push(filepath);
  }
  return programFiles;
}

if(program["listFound"]) {
  console.info("Found programs:");
  for(let workspaceId in workspacePaths) {
    let workspacePath = workspacePaths[workspaceId];
    let programs = findPrograms(workspacePath);
    console.info(`  ${workspaceId} (${workspacePath}):`);
    console.info("    " + programs.map((p) => path.relative(workspacePath, p)).join("\n    "));
    console.info();
  }

  let watchers = findWatchers(watcherPaths);
  console.info("Found watchers:");
  console.info("  " + watchers.map((p) => path.relative(root, p)).join("\n  "));
  process.exit(0);
}

if(program["headless"]) {
  if(!program["execute"]) {
    program.outputHelp();
    console.error("\nERROR: Unable to run Eve headless unless you specify a program to run with `-e <file>`");
    process.exit(1);
  }

  console.info(`Starting headless Eve instance`);
  console.info("For a complete list of Eve's configuration options, run `eve --help`");
  require(program["execute"]);

} else {
  console.info(`Starting Eve server on port '${program["port"]}'...`);
  console.info("For a complete list of Eve's configuration options, run `eve --help`");

  let opts = {
    root,
    workspacePaths,
    watcherPaths,
    watch: program["watch"],
    file: program["file"],
    port: program["port"],
    open: program["open"]
  };

  let server = new Server(opts);
  server.start();
}
