import * as path from "path";
import * as eve from "witheve";

let _posixifyRegExp = new RegExp("\\\\", "g");
export function posixify(path:string) {
  return path.replace(_posixifyRegExp, "/");
}

function copy<T extends {}>(obj:T):T {
  let neue:T = {} as T;
  for(let key in obj) {
    neue[key] = obj[key];
  }
  return neue;
}

// @NOTE: If you move this file in the hiararchy, you'll want to adjust this.
let root = posixify(path.resolve(__dirname + "/../.."));
let src = root + "/build/src";

export interface Config {
  // Paths configuration
  root: string,
  src: string,
  workspacePaths: {[workspaceId:string]: string},
  watcherPaths: string[],

  file?: string,
  watch?: boolean,

  // Server specific
  port?: number,
  open?: boolean
}

export class Conf implements Config {
  constructor(initial?:Partial<Config>) {
    if(initial) this.fromObject(initial);
  }

  protected _workspacePaths: {[workspaceId:string]: string} = {};
  protected _watcherPaths: string[] = [];

  file?: string;
  watch = false;
  port?: number;
  open?: boolean;

  get root() { return root; }
  get src() { return src; }

  get workspacePaths() {
    return copy(this._workspacePaths);
  }
  set workspacePaths(neue) {
    this._workspacePaths = {};
    for(let name in neue) {
      this.setWorkspace(name, neue[name]);
    }
  }

  setWorkspace(name:string, workspacePath:string) {
    this._workspacePaths[name] = posixify(workspacePath);
  }

  get watcherPaths() {
    return this._watcherPaths;
  }

  set watcherPaths(neue) {
    this._watcherPaths = [];
    for(let watcherPath of neue || []) {
      this.addWatchers(watcherPath);
    }
  }

  addWatchers(watcherPath:string) {
    let neue = posixify(watcherPath);
    if(this._watcherPaths.indexOf(neue) !== -1) return;
    this._watcherPaths.push(neue);
  }

  fromObject(obj:Partial<Config>) {
    for(let key of Object.keys(obj) as (keyof Config)[]) {
      (this as any)[key] = obj[key];
    }
  }
}



export var config = new Conf({
  workspacePaths: {root: root + "/build/programs"},
  watcherPaths: [root + "/build/watchers", posixify(path.join(root, "node_modules/witheve", eve.watcherPath))]
});
export default config;
