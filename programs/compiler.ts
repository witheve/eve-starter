import {Program} from "witheve";
import {CompilerWatcher} from "witheve/build/src/watchers/compiler";

let prog = new Program("compiler test");
let compiler:CompilerWatcher = prog.attach("compiler") as any;
prog.attach("ui");

/*
 * # Description
 *
 * The compiler watcher allows you to generate eve blocks from within Eve.
 * This is used by internal tooling such as the database explorer to generate
 * efficient blocks that match the user's queries.
 *
 * # Notes
 *
 * This demo is not for the faint of heart. Documenting and demoing this feature
 * is low priority since most users will never need to use it. If you need additional
 * assistance, feel free to post on the mailing list <https://groups.google.com/forum/?utm_medium=email&utm_source=footer#!forum/eve-talk>.
 *
 * It's very powerful; and with great power comes great foot-shootiness.
 * Consider carefully whether you actually need to generate a block,
 * Eve makes it very easy to manage dynamicism through data instead.
 *
 * The compiler watcher is not yet feature complete. It's currently unable to
 * represent statements like choose, union, and not.
 */

// example = "some cool block"
//
// v1 = [#eve/compiler/var]
// v2 = [#eve/compiler/var]
// vContainer = [#eve/compiler/var]
// vName = [#eve/compiler/var]
// [#eve/compiler/block name:"some cool block" type:"block" constraint:
//    [#eve/compiler/record record: v1 attribute:
//      [attribute: "tag", value: "person"]
//      [attribute: "tag", value: "employee"]
//      [attribute: "name", value: vName]]
//
//    [#eve/compiler/record record: vContainer attribute:
//      [attribute: "tag", value: "container"]
//      [attribute: "example", value: example]]
//
//    [#eve/compiler/output record: v2 attribute:
//      [attribute: "tag", value: "ui/text"]
//      [attribute: "text", value: vName]]
//
//    [#eve/compiler/output record: container attribute:
//      [attribute: "children", value: v2]]]

prog.block("Some cool block.", ({record}) => {
  let example = "some cool block";
  return [
    record("container", {example})
  ];
})

prog.block("Demo the above block.", ({find, record}) => {
  let example = "some cool block";
  let v1, v2, vName, vContainer;
  return [
    v1 = record("eve/compiler/var", {name: "v1"}),
    v2 = record("eve/compiler/var", {name: "v2"}),
    vName = record("eve/compiler/var", {name: "vName"}),
    vContainer = record("eve/compiler/var", {name: "vContainer"}),
    record("eve/compiler/block", {name: example, type: "block"}).add("constraint", [
      record("eve/compiler/record", {record: v1}).add("attribute", [
        record({attribute: "tag", value: "person"}),
        record({attribute: "tag", value: "employee"}),
        record({attribute: "name", value: vName})
      ]),

      record("eve/compiler/record", {record: vContainer}).add("attribute", [
        record({attribute: "tag", value: "container"}),
        record({attribute: "example", value: example}),
      ]),

      record("eve/compiler/output", {record: v2}).add("attribute", [
        record({attribute: "tag", value: "ui/text"}),
        record({attribute: "text", value: vName})
      ]),

      record("eve/compiler/output", {record: vContainer}).add("attribute", [
        record({attribute: "children", value: v2}),
      ])
    ])
  ];
});

prog.block("An example container is a div with a title.", ({find, record}) => {
  let container = find("container");
  return [
    container.add({tag: "html/element", tagname: "div", class: "container"}).add("children", [
      record("html/element", {sort: 0, tagname: "div", text: container.example})
    ])
  ];
})


prog.block("Add some CSS to spruce the place up.", ({record}) => {
  return [
    record("html/element", {tagname: "style", text: `
      body { flex-direction: row; justify-content: flex-start; align-content: flex-start; flex-wrap: wrap; }
      .container { flex: 0 0 auto; flex-direction: column; margin: 20; padding: 20; padding-top: 0; width: 200; height: 202; background: white; border-radius: 3px;  box-shadow: 0 3px 4px rgba(0, 0, 0, 0.1); }
      .container > div { margin: 10 0; text-align: center; }
      .container > text { display: block; }
    `})
  ];
})


prog.inputEavs([
  ["JANE", "tag", "person"],
  ["JANE", "tag", "employee"],
  ["JANE", "name", "Jane"],

  ["MEEP", "tag", "person"],
  ["MEEP", "tag", "employee"],
  ["MEEP", "name", "Meep"],
]);
