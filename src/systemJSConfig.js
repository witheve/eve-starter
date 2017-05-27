SystemJS.config({
  baseURL: "/node_modules/",
  map: {
    fs: "@empty",
    path: "@empty",
    glob: "@empty",
    mkdirp: "@empty"
  },
  meta: {
    "/programs/*": {deps: ["../../watchers.js"]},
    "/eve-programs/*": {deps: ["../../watchers.js"]},
  },
  packageConfigPaths: ['/node_modules/*/package.json'],
  packages: {
    "/build": {defaultExtension: "js"},
    "uuid": {main: "index.js", map: {"./lib/rng": "./lib/rng-browser"}},
    "commonmark": {main: "dist/commonmark.js"},
  },
});
