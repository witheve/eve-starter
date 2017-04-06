import {Program, appendAsEAVs} from "witheve";

let prog = new Program("test");
prog.attach("shape");

/*
 * # Description
 *
 * The shape watcher is an example convenience library. It doesn't add any new native functionality,
 * it just wraps some common patterns into reusable components.
 *
 * # Notes
 *
 * The hex grid is *really* slow to lay out new cells right now. This is caused
 * by an implementation issue and is being worked on. This only effects laying out
 * new cells. Once the grid is laid out performance should return to normal.
 *
 * # See Also
 *
 * - **Canvas Demo** - The Canvas watcher allows you to declaratively draw to HTML5 canvas elements.
 */

// Just a convenient shortcut vs creating a new path and calling rect directly for every square.
prog.block("Draw a square path.", ({find, lib:{math}, choose, record}) => {
  let example = "square path";
  return [
    record("canvas-container", {sort: 1, example}).add("paths", [
      record("shape/square-path", {sort: 1, x: 30, y: 20, side: 100, strokeStyle: "#404040", lineWidth: 4}),
    ])
  ];
});

// Regular hexagon with origin at the top vertex.
prog.block("Draw a hexagon path.", ({find, lib:{math}, choose, record}) => {
  let example = "hexagon path";
  return [
    record("canvas-container", {sort: 2, example}).add("paths", [
      record("shape/hexagon-path", {sort: 1, x: 35, y: 20, side: 50, strokeStyle: "#404040", lineWidth: 4})
    ])
  ];
});

// The hexagon container has both a canvas and an overlaid div positioned to allow "filling" the hex with content of your choice.
prog.block("Draw a hexagon container.", ({find, record}) => {
  let example = "hexagon container";
  return [
    record("container", {sort: 3, example}).add("children", [
      record("shape/hexagon", {sort: 2, side: 50, fillStyle: "rgba(255, 0, 0, 0.2)", style: record({margin: "30 auto"})}).add("content", [
        record("html/element", {tagname: "div", text: "content!", style: record({display: "flex", "align-self": "center"})})
      ])
    ])
  ];
});

// @TODO: Implement `range` in the stdlib. ;)
prog.commit("Add a range to create cells for the hex-grid with.", ({record}) => {
  return [
    record("range", {number: 0}),
    record("range", {number: 1}),
    record("range", {number: 2}),
    record("range", {number: 3}),
  ];
})

// The hex grid absolutely positions it's cells in tiled regular hexagons of the specified dimensions.
// @NOTE: This is really slow atm for entirely avoidable reasons. It's being worked on.
//        Thanks to incrementalism you only incur this perf penalty whenever you lay out a bunch of new cells at once though.
prog.block("Draw a hex grid.", ({find, record}) => {
  let example = "hex grid";
  let side = 15;
  let {number:x} = find("range");
  let {number:y} = find("range");
  return [
    record("container", {sort: 3, example}).add("children", [
      record("shape/hex-grid", {sort: 2, side, gap: 0, style: record({position: "relative", margin: 20, width: 120, height: 100})}).add("cell", [
        record("shape/hexagon", {class: "grid-cell", side, x, y, strokeStyle: "#aaa", lineWidth: 1})
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

prog.block("A canvas container is a regular container with a canvas in it.", ({find, record}) => {
  let container = find("canvas-container");
  return [
    container.add("tag", "container").add("children", [
      record("canvas/root", {sort: 1, width: 160, height: 140, example: container.example}).add("children", container.paths)
    ])
  ];
})

prog.block("Add some CSS to spruce the place up.", ({record}) => {
  return [
    record("html/element", {tagname: "style", text: `
      body { flex-direction: row; justify-content: flex-start; align-content: flex-start; flex-wrap: wrap; }
      .container { position: relative; flex: 0 0 auto; justify-content: center; align-items: center; margin: 20; padding: 20; padding-top: 0; width: 200; height: 202; background: white; border-radius: 3px;  box-shadow: 0 3px 4px rgba(0, 0, 0, 0.1); }
      .container > div { margin: 10 0; text-align: center; }
    `})
  ];
})


let changes:any[] = [
  ["dummy", "tag", "turtle"]
];
appendAsEAVs(changes, {tag:["my-timer", "system/timer"], resolution:16.666})
prog.inputEAVs(changes);
