import {Program, appendAsEAVs, RawEAV} from "witheve";

let prog = new Program("test");
prog.attach("ui");

prog.load(`
# Program Switcher

The program switcher is a simple example of I/O between Eve and your existing JS program.
The server supplies a list of valid program urls attached to the window as \`__config.programs\`.
We insert these into Eve and, when one is clicked, a watcher redirects the browser to that location.
Obviously this can be done using anchor tags, but that doesn't make for a very interesting demo. ;)

More detailed documentation on the watcher interface is on the way. A survival guide is in the works on the Docs repo:
<https://github.com/witheve/docs/pull/73>

## UI

Add some static CSS for the page.
~~~
commit
  [#html/element tagname: "style" text: "
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
  "]
~~~

Lay out the page.
~~~
commit
  [#ui/div #wrapper children:
    [#program-container #container #ui/column]
    [#intro-container #container #ui/div children:
      [#ui/text #header text: "Eve Starter"]
      [#ui/text text: "The starter is a playground for exploring examples and building new applications with Eve 0.3.0.\n\n"]
      [#ui/text text: "Click on a link to execute a program. Follow along with its source code in your editor of choice in "]
      [#ui/text #code text: "eve-starter/programs"]
      [#ui/text text: ". You can also create new "]
      [#ui/text #code text: ".eve"]
      [#ui/text text: " files in this directory to create your own programs."]
      [#ui/text text: " If you're new to Eve, check out the "]
      [#ui/a href: "http://docs.witheve.com/v0.3/tutorials/quickstart.eve/" text: "quickstart"]
      [#ui/text text: ". You can also find a "]
      [#ui/a href: "http://docs.witheve.com/v0.3/syntaxreference/" text: "syntax reference"]
      [#ui/text text: " and a "]
      [#ui/a href: "http://docs.witheve.com/v0.3/handbook/libraries/" text: "function reference"]
      [#ui/text text: " over in the "]
      [#ui/a href: "http://docs.witheve.com/v0.3/" text: "docs"]
      [#ui/text text: ".\n\n"]
      [#ui/text text: "If you're looking to extend your existing JS application with Eve, you can check out the "]
      [#ui/a href: "https://github.com/witheve/docs/blob/master/guides/dsl.md" text: "JS DSL docs"]
      [#ui/text text: ". The server and SystemJS configuration in this starter is one example of serving up Eve with your application. We'll have more detailed documentation on this in the future.\n\n"]
      [#ui/text text: "For more advanced functionality of the starter, run "]
      [#ui/text #code text: "npm start -- --help"]
      [#ui/text text: "."]]]
~~~
`);

prog
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

console.log("PROG", prog);
