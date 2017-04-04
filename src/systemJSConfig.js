SystemJS.config({
  baseURL: "node_modules/",
  map: {
    fs: "@empty",
    path: "@empty",
    glob: "@empty",
    mkdirp: "@empty"
  },
  meta: {
    "/programs/*": {deps: ["../../watchers.js"]}
  },
  packageConfigPaths: ['./node_modules/*/package.json'],
  packages: {
    //"/programs": {/*map: {"runtime": "../../build/"}*/ meta: {baseURL: "fooP"}},

    "/build": {defaultExtension: "js"},
    // "/node_modules": {defaultExtension: "js"},
    // "witheve": {main: "build/src/index.js"},
    // "node-uuid": {main: "uuid.js"},
    // "falafel": {main: "index.js"},
    // "acorn": {main: "dist/acorn.js"},
    // "isarray": {main: "index.js"},
    // "object-keys": {main: "index.js"},
    // "foreach": {main: "index.js"},
    // "setimmediate": {main: "setImmediate.js"},
    // "javascript-natural-sort": {main: "naturalSort.js"}
  },
});
