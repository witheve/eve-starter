import {Program, appendAsEAVs, RawEAV} from "witheve";

let prog = new Program("test");
prog.attach("ui");

prog
  .block("Draw a container for the program links.", ({record}) => {
    return [
      record("container", "ui/column").add("children", [
        record("ui/text", {sort: 0, text: "Select a program", style: record({padding: "5px 10px"})})
      ]),
      record("html/element", {tagname: "style", text: `
        body { justify-content: center; }
        .container {flex: 0 0 auto; align-self: center; align-items: flex-start; padding: 20; background: white; border-radius: 3px; box-shadow: 0 3px 4px rgba(0, 0, 0, 0.1); }
        .program-button {color: rgb(65, 161, 221); text-decoration: underline; cursor: pointer; }
      `})
    ];
  })
  .block("Draw a button for each program.", ({find, record}) => {
    let container = find("container");
    let program = find("program");
    return [
      container.add("children", [
        record("program-button", "ui/button", {sort: program.url, program, text: program.url})
      ])
    ];
  })
  .block("If there aren't any programs, tell the user.", ({find, not, record}) => {
    let container = find("container");
    not(() => find("program"));
    return [
      container.add("children", [
        record("ui/text", {text: "I wasn't able to find any programs in the specified workspace(s). :("})
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
prog.inputEavs(programEAVs)

console.log(programs);
