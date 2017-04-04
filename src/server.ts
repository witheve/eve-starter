import * as path from "path";
import * as express from "express";
import * as http from "http";
import * as glob from "glob";
import open = require("open");
import * as witheve from "witheve";
import config from "./config";

interface ProcessError extends Error { errno?: string; }

export class Server {
  app:express.Express;
  rawServer:http.Server;

  constructor() {}
  start() {
    // If the port is already in use, display an error message
    config.port = config.port || 8000;
    console.info(`Starting Eve server on port '${config.port}'...`);
    process.on('uncaughtException', (err:ProcessError) => {
      if(err.errno === 'EADDRINUSE') {
        console.log(`ERROR: Eve couldn't start because port ${config.port} is already in use.\n\nYou can select a different port for Eve using the "port" argument.\nFor example:\n\n> eve --port 1234`);
      } else {
        throw err;
      }
      process.exit(1);
    });

    this.reload();
  }

  reload() {
    this.app = express();

    this.app.get("/", this.serveIndex);
    this.app.get("/bootstrap.js", this.serveBootstrap);
    this.app.get("/assets/*", this.serveAssets);
    this.app.get("/build/*", this.serveSource);
    this.app.get("/src/*", this.serveSource);
    this.app.get("/node_modules/*", this.serveNodeModules);
    this.app.get("/watchers.js", this.serveWatchers);
    this.app.get("/programs/:workspaceId/:programId", this.servePrograms);
    this.app.get("/select-program/:workspaceId/:programId", this.selectProgram);

    if(this.rawServer) this.rawServer.close();
    this.rawServer = http.createServer(this.app);
    this.rawServer.listen(config.port, () => {
      console.log("Server started.");
      if(config.open) open(`http://localhost:${config.port}`);
    });
  }

  serveIndex:express.RequestHandler = (req, res, next) => {
    res.sendFile("index.html", {root: config.root}, (err) => {
      if(err) next(err);
      else console.log("Served:", "index.html");
    });
  }

  serveAssets:express.RequestHandler = (req, res, next) => {
    this.serveStaticFile(req.params[0], [config.root + "/assets"], res, next);
  }

  serveSource:express.RequestHandler = (req, res, next) => {
    let searchPaths = [
      config.root + "/build",
      config.root + "/src",
    ];
    this.serveStaticFile(req.params[0], searchPaths, res, next);
  }

  serveNodeModules:express.RequestHandler = (req, res, next) => {
    let searchPaths = [
      config.root + "/node_modules",
      config.root + "/node_modules/witheve/node_modules", // Unfortunate. :/
    ];
    this.serveStaticFile(req.params[0], searchPaths, res, next);
  }

  serveWatchers:express.RequestHandler = (req, res, next) => {
    let watchers = witheve.findWatchers(config.watcherPaths);
    let content = "";
    for(let filepath of watchers) {
      let reqPath = path.relative(config.root, filepath);
      if(reqPath.indexOf("node_modules/") === 0) reqPath = reqPath.slice("node_modules/".length);
      content += `require("${reqPath}");\n`;
    }
    res.send(content);
  }

  servePrograms:express.RequestHandler = (req, res, next) => {
    let {workspaceId, programId} = req.params;
    let workspacePath = config.workspacePaths[workspaceId];
    if(!workspacePath) {
      res.sendStatus(400);
      return;
    }
    this.serveStaticFile(programId, [workspacePath], res, next);
  }

  selectProgram:express.RequestHandler = (req, res, next) => {
    let {workspaceId, programId} = req.params;
    config.file = workspaceId + "/" + programId;
    console.log(workspaceId, programId);
    res.sendStatus(200);
  }

  // Construct an appropriate bootstrap for the given request.
  serveBootstrap:express.RequestHandler = (req, res, next) => {
    if(config.file) {
      res.send(`
        var __config = ${JSON.stringify(config)};
        SystemJS.import("../programs/${config.file}");
      `);
    } else {
      // @FIXME: We don't want to be calling glob synchronously in this path.
      let programFiles:string[] = [];
      let workspacePaths = config.workspacePaths;
      console.log(workspacePaths);
      for(let workspaceId in workspacePaths) {
        let workspacePath = workspacePaths[workspaceId];
        for(let filepath of glob.sync(workspacePath + "/*.js")) {
          programFiles.push(workspaceId + "/" + path.relative(workspacePath, filepath));
        }
      }
      res.send(`
        var __config = ${JSON.stringify(config)};
        __config.programs = ${JSON.stringify(programFiles)};
        SystemJS.import("./programs/root/program-switcher.js");
      `);
    }
  }

  serveStaticFile(file:string, searchPaths:string[], res:express.Response, next:express.NextFunction, curIx = 0) {
    let current = searchPaths[curIx] + "/" + file;
    res.sendFile(file, {root: searchPaths[curIx]}, (err) => {
      if(err) {
        if(curIx + 1 < searchPaths.length) {
          this.serveStaticFile(file, searchPaths, res, next, curIx + 1);
        } else next(err);

      } else {
        console.log(`Served: '${file}' from '${searchPaths[curIx]}'`);
      }
    });
  }

  computeDeps(file:string) {

  }
}
