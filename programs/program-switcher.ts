import {Program, appendAsEAVs, RawEAV} from "witheve";

/* # Program Switcher
 *
 * The program switcher is a simple example of I/O between Eve and your existing JS program.
 * The server supplies a list of valid program urls attached to the window as `__config.programs`.
 * We insert these into Eve and, when one is clicked, a watcher redirects the browser to that location.
 * Obviously this can be done using anchor tags, but that doesn't make for a very interesting demo. ;)
 *
 * More detailed documentation on the watcher interface is on the way. A survival guide is in the works on the Docs repo:
 * <https://github.com/witheve/docs/pull/73>
 */

let prog = new Program("test");
prog.attach("ui");

prog
  .commit("Add some static CSS for the page.", ({record}) => {
    return [
      record("html/element", {tagname: "style", text: `
        body { height: 100%; }
        .wrapper { display: flex; flex-direction: row; justify-content: flex-start; align-items: center; height: 100%; }
        a { display: inline-block; }
        .container {flex: 0 0 auto; align-items: flex-start; max-width: 520px; padding: 20px; background: white; border-radius: 3px; box-shadow: 0 3px 4px rgba(0, 0, 0, 0.1); line-height: 1.5; }

        .intro-container { flex: 0 1 auto; margin: auto; }
        .container > text { display: inline; }
        .container > .header { display: block; width: 100%; margin-bottom: 1em; text-align: center; }
        .container > .code { padding: 0 5px; background: #eee; border-radius: 3px; font-family: 'courier new'; white-space: nowrap; }

        .program-container { align-self: stretch; overflow-y: auto; }
        .program-button {color: rgb(65, 161, 221); cursor: pointer; }
        .program-button:hover {color: rgb(78, 193, 255); text-decoration: underline; }

        @media (max-width: 800px) {
          .wrapper { flex-direction: column; align-items: stretch; }
          .container { max-width: initial; margin: 20px 40px; }
          .program-container { order: 2; }
        }
      `})
    ]
  })
  .commit("Lay out the page.", ({record}) => {
    return [
      record("ui/div", "wrapper", {children: [
        record("program-container", "container", "ui/column"),
        record("intro-container", "container", "ui/div", {children: [
          record("ui/text", "header", {sort: 1, text: "Eve Starter"}),
          record("ui/text", {sort: 2, text: "The starter is a playground for exploring examples and building new applications with Eve 0.3.0.\n\n"}),
          record("ui/text", {sort: 3, text: "Click on a link to execute a program. Follow along with its source code in your editor of choice in "}),
          record("ui/text", "code", {sort: 4, text: "eve-starter/programs"}),
          record("ui/text", {sort: 5, text: ". You can also create new "}),
          record("ui/text", "code", {sort: 6, text: ".eve"}),
          record("ui/text", {sort: 7, text: " files in this directory to create your own programs."}),
          record("ui/text", {sort: 8, text: " If you're new to Eve, check out the "}),
          record("ui/a", {sort: 9, href: "http://docs.witheve.com/v0.3/tutorials/quickstart.eve/", text: "quickstart"}),
          record("ui/text", {sort: 10, text: ". You can also find a "}),
          record("ui/a", {sort: 11, href: "http://docs.witheve.com/v0.3/syntaxreference/", text: "syntax reference"}),
          record("ui/text", {sort: 12, text: " and a "}),
          record("ui/a", {sort: 13, href: "http://docs.witheve.com/v0.3/handbook/libraries/", text: "function reference"}),
          record("ui/text", {sort: 14, text: " over in the "}),
          record("ui/a", {sort: 15, href: "http://docs.witheve.com/v0.3/", text: "docs"}),
          record("ui/text", {sort: 16, text: ".\n\n"}),
          record("ui/text", {sort: 17, text: "If you're looking to extend your existing JS application with Eve, you can check out the "}),
          record("ui/a", {sort: 18, href: "https://github.com/witheve/docs/blob/master/guides/dsl.md", text: "JS DSL docs"}),
          record("ui/text", {sort: 19, text: ". The server and SystemJS configuration in this starter is one example of serving up Eve with your application. We'll have more detailed documentation on this in the future.\n\n"}),
          record("ui/text", {sort: 20, text: "For more advanced functionality of the starter, run "}),
          record("ui/text", "code", {sort: 21, text: "npm start -- --help"}),
          record("ui/text", {sort: 22, text: "."})
        ]})
      ]})
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
