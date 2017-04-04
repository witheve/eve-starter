import {Program, appendAsEAVs, RawEAV} from "witheve";

let prog = new Program("test");
prog.attach("ui");

prog
  .block("Draw a button for each program.", ({find, record}) => {
    let program = find("program");
    return [
      record("program-button", "ui/button", {program, text: program.url})
    ];
  });

prog
  .commit("Clicking a program button changes the active program.", ({find, record}) => {
    let program_button = find("program-button");
    find("html/event/click", {element: program_button});
    //find("html/event/click");
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
      let req = new XMLHttpRequest();
      req.open("GET", "/select-program/" + url, false);
      req.send();
      location.reload(true);
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
