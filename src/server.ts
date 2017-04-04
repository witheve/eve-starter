import * as path from "path";
import * as fs from "fs";
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

    this.app.get("/assets/*", this.sendStatic([config.root + "/assets"]));
    this.app.get("/build/*", this.sendStatic([config.root + "/build"]));
    this.app.get("/src/*", this.sendStatic([config.root + "/src"]));
    this.app.get("/node_modules/*", this.sendStatic([
      config.root + "/node_modules",
      config.root + "/node_modules/witheve/node_modules", // Unfortunate. :/
    ]));

    this.app.get("/", this.serveIndex);
    this.app.get("/app/:workspaceId/:programId", this.serveApp);
    this.app.get("/programs/:workspaceId/:programId", this.servePrograms);

    this.app.get("/watchers.js", this.serveWatchers);

    if(this.rawServer) this.rawServer.close();
    this.rawServer = http.createServer(this.app);
    this.rawServer.listen(config.port, () => {
      console.log("Server started.");
      if(config.open) open(`http://localhost:${config.port}`);
    });
  }

  serveIndex:express.RequestHandler = (req, res, next) => {
    let bootstrap = "";
    if(config.file) {
      bootstrap += `SystemJS.import("/programs/${config.file}");\n`;
    } else {
      let programs = this.findPrograms();
      bootstrap += `__config.programs = ${JSON.stringify(programs)};\n`;
      bootstrap += `SystemJS.import("/programs/root/program-switcher.js");\n`
    }
    this.sendApp(bootstrap, res);
  }

  serveApp:express.RequestHandler = (req, res, next) => {
    if(config.file) res.status(401);
    let {workspaceId, programId} = req.params;
    let file = workspaceId + "/" + programId;
    let bootstrap = `SystemJS.import("/programs/${file}");\n`;
    this.sendApp(bootstrap, res);
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
    this.sendStaticFile(programId, [workspacePath], res, next);
  }

  sendStatic(searchPaths:string[]) {
    let handler:express.RequestHandler = (req, res, next) => {
      this.sendStaticFile(req.params[0], searchPaths, res, next);
    };
    return handler;
  }

  sendStaticFile(file:string, searchPaths:string[], res:express.Response, next:express.NextFunction, curIx = 0) {
    let current = searchPaths[curIx] + "/" + file;
    res.sendFile(file, {root: searchPaths[curIx]}, (err) => {
      if(err) {
        if(curIx + 1 < searchPaths.length) {
          this.sendStaticFile(file, searchPaths, res, next, curIx + 1);
        } else next(err);

      }
    });
  }

  sendApp(bootstrap:string, res:express.Response) {
    bootstrap = `var __config = ${JSON.stringify(config)};\n${bootstrap}`;
    bootstrap.split("\n").join("\n      "); // Purely for aesthetics of the generated html.
    fs.readFile("index.html", (err, data) => {
      let content = data.toString();
      content = content.replace("<!-- BOOTSTRAP -->", bootstrap);
      res.status(200).send(content);
    });
  }

  findPrograms() {
    // @FIXME: We really need to cache this.
    let programFiles:string[] = [];
    let workspacePaths = config.workspacePaths;
    for(let workspaceId in workspacePaths) {
      let workspacePath = workspacePaths[workspaceId];
      for(let filepath of glob.sync(workspacePath + "/*.js")) {
        programFiles.push(workspaceId + "/" + path.relative(workspacePath, filepath));
      }
    }
    return programFiles;
  }

}
