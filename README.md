<p align="center">
  <img src="http://www.witheve.com/logo.png" alt="Eve logo" width="10%" />
</p>

---

The Eve Starter is designed to help you hit the ground running with Eve. It includes a number of simple demo programs, a CLI that lets you test Eve programs in node or the browser, and a server that handles most of the frustrations of packaging node modules for the web for you. When you're ready to start building with Eve, you can either modify this framework to suit or just include the runtime into an existing project.

If you're an experienced Eve user looking to include it in your existing app, you can find the runtime at [witheve/eve](https://github.com/witheve/eve).

## Getting Started with Eve v0.3 preview

Install [Node](https://nodejs.org/en/download/) for your platform, then clone and build the Eve starter repository:

```sh
git clone git@github.com:witheve/eve-starter.git
cd eve-starter
npm install
```

You can start the program switcher, which allows you to browse included example programs:

```sh
npm start
```

Or you can run a specific program by providing its path as an argument:

```sh
npm start -- path/to/program.js
```

To view other functionality of the starter, run
```sh
npm start -- --help
```
