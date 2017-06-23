<p align="center">
  <img src="http://www.witheve.com/logo.png" alt="Eve logo" width="10%" />
</p>

---

The Eve Starter is designed to help you hit the ground running with Eve. It includes a number of simple demo programs, a CLI that lets you test Eve programs in node or the browser, and a server that handles most of the frustrations of packaging node modules for the web for you. When you're ready to start building with Eve, you can either modify this framework to suit or just include the runtime into an existing project.

If you're an experienced Eve user looking to include it in your existing app, you can find the runtime at [witheve/eve](https://github.com/witheve/eve).

## Install the Eve v0.3 Starter Preview

First install [Node](https://nodejs.org/en/download/) for your platform.

Then, clone and build the Eve starter repository:

```sh
git clone git@github.com:witheve/eve-starter.git
```

To run the latest stable version:

```sh
cd eve-starter
git checkout release
npm install
```

To run the latest nightly version:

```sh
cd eve-starter
git checkout master
npm install
```

## Using the Starter

If you want to explore the bundled examples you can start the program switcher, which allows you to explore them from your browser. Any `*.eve` files places into the `eve-starter/programs` directory will be shown here.

```sh
npm start
```

Or you can run a specific `.eve` or `.js` program by providing its path as an argument:

```sh
npm start -- path/to/program.js
```

To view other functionality of the starter, run
```sh
npm start -- --help
```
