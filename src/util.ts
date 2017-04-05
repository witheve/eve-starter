import * as path from "path";
import * as glob from "glob";

let _posixifyRegExp = new RegExp("\\\\", "g");
export function posixify(path:string) {
  return path.replace(_posixifyRegExp, "/");
}

export function copy<T extends {}>(obj:T):T {
  let neue:T = {} as T;
  for(let key in obj) {
    neue[key] = obj[key];
  }
  return neue;
}

export function findPrograms(workspacePath:string) {
  let programFiles:string[] = [];
  for(let filepath of glob.sync(workspacePath + "/*.js")) {
    programFiles.push(posixify(filepath));
  }
  return programFiles;
}

export function findWatchers(watcherPaths:string[], relative = false) {
  let watcherFiles:string[] = [];
  for(let watcherPath of watcherPaths) {
    for(let filepath of glob.sync(watcherPath + "/**/*.js")) {
      if(filepath === __filename) continue;
      if(relative) filepath = path.relative(watcherPath, filepath);
      watcherFiles.push(posixify(filepath));
    }
  }
  return watcherFiles;
}
