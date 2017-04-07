import {Program, appendAsEAVs, RawEAV} from "witheve";

let prog = new Program("test");
prog.attach("ui");

/*
 * # Description
 *
 * The program switcher is a simple example of I/O between Eve and your existing JS program.
 * The server supplies a list of valid program urls attached to the window as `__config.programs`.
 * We insert these into Eve and, when one is clicked, a watcher redirects the browser to that location.
 * Obviously this can be done using anchor tags, but that doesn't make for a very interesting demo. ;)
 *
 * # Notes
 *
 * More detailed documentation on the watcher interface is on the way. A survival guide is in the works on the Docs repo:
 * <https://github.com/witheve/docs/pull/73>
 */

prog
  .bind("Draw a container for the program links.", ({record}) => {
    return [
      record("program-container", "container", "ui/column", {sort: 2}),
      record("intro-container", "container", "html/element", {sort: 3, tagname: "div"}),
      record("html/element", {tagname: "style", text: `
        body { flex-direction: row; justify-content: flex-start; align-items: center; }
        a { display: inline-block; }
        .container {flex: 0 0 auto; align-items: flex-start; max-width: 500; padding: 20; background: white; border-radius: 3px; box-shadow: 0 3px 4px rgba(0, 0, 0, 0.1); line-height: 1.5; }

        .intro-container { flex: 0 1 auto; margin: auto; }
        .container > text { display: inline; }
        .container > .header { display: block; width: 100%; margin-bottom: 1em; text-align: center; }
        .container > .code { padding: 0 5; background: #eee; border-radius: 3px; font-family: "courier new"; white-space: nowrap; }

        .program-container { align-self: stretch; overflow-y: auto; }
        .program-button {color: rgb(65, 161, 221); cursor: pointer; }
        .program-button:hover {color: rgb(78, 193, 255); text-decoration: underline; }

        @media (max-width: 800px) {
          body { flex-direction: column; align-items: stretch; }
          .container { max-width: initial; margin: 20 40; }
          .program-container { order: 2; }
        }
      `})
    ];
  })
  .bind("Fill the intro box with some friendly introductory text.", ({find, record}) => {
    let container = find("intro-container");
    return [
      container.add("children", [
        record("ui/text", {sort: 1, class: "header", text: "Eve Starter"}),
        record("ui/text", {sort: 2, text: "The starter is a playground for exploring examples and building new applications with Eve 0.3.0.\n\nClick on a link to execute a program. Follow along with its source code in your editor of choice in "}),
        record("ui/text", {sort: 3, class: "code", text: "eve-starter/programs/"}),
        record("ui/text", {sort: 4, text: ". For a primer on working with Eve's new JavaScript DSL, check out "}),
        record("html/element", {sort: 5, tagname: "a", href: "https://github.com/witheve/docs/blob/master/guides/dsl.md", text: "the DSL guide"}),
        record("ui/text", {sort: 6, text: ".\n\nOnce you've explored the examples and want to start writing your own programs, you can modify the starter to suit your needs.  For more advanced functionality of the starter, run "}),
        record("ui/text", {sort: 7, class: "code", text: "npm start -- --help"}),
        record("ui/text", {sort: 8, text: "."}),

      ])
    ];
  })

  .bind("Draw a button for each program.", ({find, record}) => {
    let container = find("program-container");
    let program = find("program");
    return [
      container.add("children", [
        record("ui/text", {sort: 0, class: "header", text: "Select a program"}),
        record("program-button", "ui/button", {sort: program.url, program, text: program.url})
      ])
    ];
  })
  .bind("If there aren't any programs, tell the user.", ({find, not, record}) => {
    let container = find("container");
    not(() => find("program"));
    return [
      container.add("children", [
        record("ui/text", {text: "I wasn't able to find any programs... :("})
      ])
    ];
  });
prog
  .commit("Clicking a program button changes the active program.", ({find, record}) => {
    let program_button = find("program-button");
    find("html/event/click", {element: program_button});
    return [
      record("active-program", {program: program_button.program})
    ];
  })
  .watch("Changing the active program updates the server and refreshes the page.", ({find, record}) => {
    let active = find("active-program");
    return [
      record({url: active.program.url})
    ];
  })
  .asDiffs((diffs) => {
    for(let [_, __, url] of diffs.adds) {
      location.pathname = "/app/" + url;
    }
  })

let config = (global as any).__config;
let programs:string[] = config && config.programs || [];

let programEAVs:RawEAV[] = [];
for(let program of programs) {
  appendAsEAVs(programEAVs, {tag: "program", url: program})
}

if(!programEAVs.length) {
  programEAVs.push(["dummy", "tag", "dummy"]);
}
prog.inputEAVs(programEAVs)

console.log(programs);
