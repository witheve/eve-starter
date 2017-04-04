SystemJS.config({
  baseURL: "/node_modules/",
  map: {
    fs: "@empty",
    path: "@empty",
    glob: "@empty",
    mkdirp: "@empty"
  },
  meta: {
    "/programs/*": {deps: ["../../watchers.js"]}
  },
  packageConfigPaths: ['/node_modules/*/package.json'],
  packages: {
    "/build": {defaultExtension: "js"},
  },
});
