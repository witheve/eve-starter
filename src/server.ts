import * as path from "path";
import * as express from "express";
import * as http from "http";
import open = require("open");
import * as witheve from "witheve";

interface ProcessError extends Error { errno?: string; }

interface ServerConfig {
  root: string,
  workspacePaths: {[workspaceId:string]: string},
  watcherPaths: string[],
  watch?: boolean,
  file?: string,
  port: number,
  open?: boolean
}

export class Server {
  app:express.Express;
  rawServer:http.Server;

  constructor(public config:ServerConfig) {
  }
  start() {
    // If the port is already in use, display an error message
    process.on('uncaughtException', (err:ProcessError) => {
      if(err.errno === 'EADDRINUSE') {
        console.log(`ERROR: Eve couldn't start because port ${this.config.port} is already in use.\n\nYou can select a different port for Eve using the "port" argument.\nFor example:\n\n> eve --port 1234`);
      } else {
        throw err;
      }
      process.exit(1);
    });

    this.reload();
  }

  reload(config:ServerConfig = this.config) {
    this.config = config;
    this.app = express();

    this.app.get("/", this.serveIndex);
    this.app.get("/bootstrap.js", this.serveBootstrap);
    this.app.get("/assets/*", this.serveAssets);
    this.app.get("/build/*", this.serveSource);
    this.app.get("/src/*", this.serveSource);
    this.app.get("/node_modules/*", this.serveNodeModules);
    this.app.get("/programs/:workspaceId/:programId", this.servePrograms);
    this.app.get("/watchers.js", this.serveWatchers);
    // this.app.get("/watchers/:watcherId", this.serveWatchers);
    // this.app.get("/watcher-deps/:watcherId/*", this.serveWatcherDeps);

    if(this.rawServer) this.rawServer.close();
    this.rawServer = http.createServer(this.app);
    this.rawServer.listen(this.config.port, () => {
      if(this.config.open) {
        console.log("Server started.");
        open(`http://localhost:${this.config.port}`);
      }
    });
  }

  serveIndex:express.RequestHandler = (req, res, next) => {
    res.sendFile("index.html", {root: this.config.root}, (err) => {
      if(err) next(err);
      else console.log("Served:", "index.html");
    });
  }

  serveAssets:express.RequestHandler = (req, res, next) => {
    this.serveStaticFile(req.params[0], [this.config.root + "/assets"], res, next);
  }

  serveSource:express.RequestHandler = (req, res, next) => {
    let searchPaths = [
      this.config.root + "/build",
      this.config.root + "/src",
    ];
    this.serveStaticFile(req.params[0], searchPaths, res, next);
  }

  serveNodeModules:express.RequestHandler = (req, res, next) => {
    let searchPaths = [
      this.config.root + "/node_modules",
      this.config.root + "/node_modules/witheve/node_modules", // Unfortunate. :/
    ];
    this.serveStaticFile(req.params[0], searchPaths, res, next);
  }

  servePrograms:express.RequestHandler = (req, res, next) => {
    let {workspaceId, programId} = req.params;
    let workspacePath = this.config.workspacePaths[workspaceId];
    if(!workspacePath) {
      res.sendStatus(400);
      return;
    }
    this.serveStaticFile(programId, [workspacePath], res, next);
  }

  // Construct an appropriate bootstrap for the given request.
  serveBootstrap:express.RequestHandler = (req, res, next) => {
    if(this.config.file) {
      res.send(`
        var __config = ${JSON.stringify(this.config)};
        SystemJS.import("../programs/${this.config.file}");
      `);
    } else {
      console.error("Error: Serving the program switcher is not yet supported.");
      res.sendStatus(400);
    }
  }

  serveWatchers:express.RequestHandler = (req, res, next) => {
    let watchers = witheve.findWatchers(this.config.watcherPaths);
    let content = "";
    for(let filepath of watchers) {
      let reqPath = path.relative(this.config.root, filepath);
      if(reqPath.indexOf("node_modules/") === 0) reqPath = reqPath.slice("node_modules/".length);
      content += `require("${reqPath}");\n`;
    }

    res.send(content);
  }


  // getRequestPath(req:express.Request) {
  //   return req.path;
  // }

  // createStaticRouteHandlers(searchPaths:string[], requestToPath:(req:express.Request) => string = this.getRequestPath):express.RequestHandler[] {
  //   let handlers:express.RequestHandler[] = [];
  //   return handlers;
  // }

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
