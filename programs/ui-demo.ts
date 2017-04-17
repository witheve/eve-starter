import {Program} from "witheve";

let prog = new Program("UI Demo");
prog.attach("ui");

/*
 * # Description
 *
 * The UI watcher provides a couple convenient html components that you can tweak to meet your needs.
 * It provides shorthand flex layout tags, buttons, and more complex components like autocomplete and editable tables.
 *
 * # Notes
 *
 * If the UI watcher doesn't meet your needs (or you just don't like it), you can instead use the underlying html watcher
 * To directly render raw html elements declaratively.
 */


prog.bind("Demo column.", ({record}) => {
  let example = "column";
  return [
    record("container", {sort: 1, example}).add("children", [
      record("ui/column", {sort: 2, example, style: record({flex: 1})}).add("children", [
        record("ui/row", {sort: 1, class: "outline"}),
        record("ui/row", {sort: 2, class: "outline"}),
        record("ui/row", {sort: 3, class: "outline"}),
      ])
    ])
  ];
});

prog.bind("Demo row.", ({record}) => {
  let example = "row";
  return [
    record("container", {sort: 2, example}).add("children", [
      record("ui/row", {sort: 2, example, style: record({flex: 1})}).add("children", [
        record("ui/column", {sort: 1, class: "outline"}),
        record("ui/column", {sort: 2, class: "outline"}),
        record("ui/column", {sort: 3, class: "outline"}),
      ])
    ])
  ];
});

prog.bind("Demo button.", ({record}) => {
  let example = "button";
  return [
    record("container", {sort: 3, example}).add("children", [
      record("ui/column", {sort: 2, example, style: record({flex: 1, "justify-content": "space-around"})}).add("children", [
        record("ui/row", {sort: 1, example, kind: "inset"}).add("children", [
          record("ui/button", {sort: 1, class: "inset", text: "inset", style: record({flex: 1})}),
          record("ui/button", {sort: 2, class: "inset", icon: "alert-circled"}),
        ]),
        record("ui/button", {sort: 2, class: "inset", text: "inset", icon: "alert-circled"}),

        record("ui/row", {sort: 3, example, kind: "flat"}).add("children", [
          record("ui/button", {sort: 1, class: "flat", text: "flat", style: record({flex: 1})}),
          record("ui/button", {sort: 2, class: "flat", icon: "alert-circled"}),
        ]),
      ])
    ])
  ];
});

prog.bind("Demo autocomplete.", ({find, record}) => {
  let example = "autocomplete";
  let person = find("person");
  return [
    record("container", {sort: 4, example}).add("children", [
      record("ui/autocomplete", {sort: 2, placeholder: "person..."}).add("completion", [
        record({text: person.name})
      ])
    ])
  ];
});

prog.bind("Demo field-table", ({find, lookup, record}) => {
  let example = "table";
  let person = find("person", "jeff");
  let {attribute, value} = lookup(person);
  attribute != "tag";
  return [
    record("container", "expando", {sort: 5, example, person}).add("children", [
      record("ui/field-table", {sort: 2, example, person}).add("field", record({example, attribute, value}))
    ])
  ];
});

prog.bind("Demo editable field-table", ({find, lookup, record}) => {
  let example = "editable table";
  let person = find("person", "jeff");
  let {attribute, value} = lookup(person);
  attribute != "tag";
  return [
    record("container", "expando", {sort: 6, example, person}).add("children", [
      record("ui/field-table", {sort: 2, example, person})
        .add("editable", ["field", "attribute", "value"])
        .add("field", record({example, attribute, value}))
    ])
  ];
});

// prog.bind("Display field changes", ({find, choose, record}) => {
//   let container = find("container", {example: "editable field-table"});
//   let table = find("ui/field-table", {person: container.person});
//   let field_change = table.change;
//   let cell = field_change.cell;
//   let [label] = choose(
//     () => {cell.column == "attribute"; return ""; },
//     () => `${field_change.field.attribute}: `
//   );
//   return [
//     container.add("children", [
//       record("ui/column", "changelog", {sort: 3, field_change, style: record({})}).add("children", [
//         record("ui/text", {sort: cell.column, text: `${label}${cell.initial} => ${cell.value}`})
//       ])
//     ])
//   ];
// });


prog.commit("Test data for autocomplete and field table", ({find, record}) => {
  return [
    record("person", "jeff", {name: "Jeff Smith", age: 27, weight: 172, eyes: "blue"}),
    record("person", {name: "George Washington"}),
    record("person", {name: "Svenka Peterson"}),
    record("person", {name: "Jeff Bloom"}),
    record("person", {name: "Jean Gray"})
  ];
});

prog.bind("An example container is a div with a title.", ({find, record}) => {
  let container = find("container");
  return [
    container.add({tag: "ui/column", class: "container"}).add("children", [
      record("ui/text", {sort: 0, text: container.example})
    ])
  ];
})

prog.bind("Add some CSS to spruce the place up.", ({record}) => {
  return [
    record("html/element", {tagname: "style", text: `
      body { flex-direction: row; justify-content: flex-start; align-content: flex-start; flex-wrap: wrap; }
      .container { flex: 0 0 auto; margin: 20px; padding: 20px; padding-top: 0; width: 200px; height: 202px; background: white; border-radius: 3px;  box-shadow: 0 3px 4px rgba(0, 0, 0, 0.1); }
      .container > text:first-child { margin: 10px 0; text-align: center; }
      .container.expando { align-self: flex-start; width: auto; height: auto; min-height: 202px; }

      .outline { flex: 1; border: 1px solid #ccc; }
      column > .outline + .outline { border-top-width: 0; }
      row > .outline + .outline { border-left-width: 0; }

      row > .button + .button { margin-left: 10px; }

      .ui-autocomplete { width: 100%; }

      .changelog { flex: 0 0 auto; padding: 10px; margin: 10px; border: 1px solid #ccc; }
    `})
  ];
})


prog.inputEAVs([
  [1, "tag", "turtle"]
]);
