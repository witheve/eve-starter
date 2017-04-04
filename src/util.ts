import * as path from "path";
import * as glob from "glob";

export function findPrograms(workspacePath:string) {
  let programFiles:string[] = [];
  for(let filepath of glob.sync(workspacePath + "/*.js")) {
    programFiles.push(filepath);
  }
  return programFiles;
}

export function findWatchers(watcherPaths:string[], relative = false) {
  let watcherFiles:string[] = [];
  for(let watcherPath of watcherPaths) {
    for(let filepath of glob.sync(watcherPath + "/**/*.js")) {
      if(filepath === __filename) continue;
      if(relative) filepath = path.relative(watcherPath, filepath);
      watcherFiles.push(filepath);
    }
  }
  return watcherFiles;
}
