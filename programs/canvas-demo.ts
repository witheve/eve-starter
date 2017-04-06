import {Program, appendAsEAVs} from "witheve";

let prog = new Program("test");
prog.attach("system"); // For the timer
prog.attach("canvas");

/*
 * # Description
 *
 * The Canvas watcher allows you to declaratively draw to HTML5 canvas elements.
 *
 * # Terms
 *
 * - `canvas/root` is an html canvas element <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas>.
 * - `canvas/path` is a Path2D <https://developer.mozilla.org/en-US/docs/Web/API/Path2D>.
 * - Children of `canvas/path`s are operations to execute on their parent.
 *
 * # Notes
 *
 * Canvas has an inherently sequential API. This sequence is reflected in Eve using the `sort` attribute.
 * Paths with higher sorts will draw on top of paths with lower sorts. Ditto for operations.
 *
 * Style properties <https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors> can be set
 * as attributes of the path.
 *
 * Pay special attention to the `example` attribute. It's used to make the containers and canvases of each example unique.
 * Without it, both blocks would write into the same canvas in the same container, leading to a single canvas with all the paths
 * of the individual examples in it!
 *
 * In the current version of the canvas watcher, all attributes for an operation are *required*. We'll fix this in the future.
 *
 * For optimal performance, it's recommended that you try to separate things which change frequently
 * and things that don't into separate paths, as the Canvas API requires rerendering an entire path when it changes.
 *
 * # See Also
 *
 * - **Shape Demo** - Canvas has primitive operations for many shapes. For those it doesn't, you can easily build your own reusable path-making blocks.
 *     The Shape watcher has a few of these available already.
 */


prog.block("Draw a simple square.", ({find, record}) => {
  let example = "Square";
  return [
    record("container", {example}).add("children", [
      record("canvas/root", {sort: 1, width: 160, height: 140, example}).add("children", [
        record("canvas/path", {sort: 1, fillStyle: "rgb(0, 158, 224"}).add("children", [
          record({sort: 1, type: "rect", x: 30, y: 20, width: 100, height: 100})
        ])
      ])
    ])
  ];
});

prog.block("Draw a compound path.", ({find, record}) => {
  let example = "Compound path";
  return [
    record("container", {example}).add("children", [
      record("canvas/root", {sort: 1, width: 160, height: 140, example}).add("children", [
        record("canvas/path", {sort: 1, strokeStyle: "rgb(91, 89, 164)", lineWidth: 2, lineCap: "square", lineJoin: "bevel"}).add("children", [
          record({sort: 1, type: "rect", x: 50, y: 30, width: 50, height: 75}),
          record({sort: 2, type: "moveTo", x: 100, y: 55}),
          record({sort: 3, type: "ellipse", x: 100, y: 75, radiusX: 25, radiusY: 50, rotation: 0, startAngle: 0, endAngle: 3.14 * 3 / 4, anticlockwise: "false"})
        ]),
      ])
    ])
  ];
});

prog.block("Draw a canvas with multiple paths.", ({find, record}) => {
  let example = "Multiple paths";
  return [
    record("container", {example}).add("children", [
      record("canvas/root", {sort: 1, width: 160, height: 140, example}).add("children", [
        record("canvas/path", {sort: 1, fillStyle: "rgb(0, 184, 241)"}).add("children", [
          record({sort: 1, type: "rect", x: 40, y: 25, width: 50, height: 100})
        ]),
        record("canvas/path", {sort: 1, strokeStyle: "rgb(0, 121, 177)", lineWidth: 10, lineCap: "round", lineJoin: "miter"}).add("children", [
          record({sort: 1, type: "moveTo", x: 100, y: 25}),
          record({sort: 2, type: "lineTo", x: 125, y: 50}),
          record({sort: 3, type: "lineTo", x: 100, y: 75}),
          record({sort: 4, type: "lineTo", x: 125, y: 100}),
          record({sort: 5, type: "lineTo", x: 100, y: 125})
        ]),
      ])
    ])
  ];
});

prog.block("Reusable equilateral triangle path block.", ({find, lib:{math}, record}) => {
  let triangle = find("triangle");
  let {x, y, side} = triangle;
  let adjacent = side * math.cos(30); // height of the triangle.
  return [
    triangle.add({tag: "canvas/path"}).add("children", [
      record({sort: 1, type: "moveTo", x, y}),
      record({sort: 2, type: "lineTo", x: x + side / 2, y: y + adjacent}),
      record({sort: 3, type: "lineTo", x: x - side / 2, y: y + adjacent}),
      record({sort: 4, type: "closePath"}) // Draws a line back to the first vertex.
    ])
  ];
})

prog.block("Draw a canvas with a reusable path component.", ({find, record}) => {
  let example = "Reusable path component";
  return [
    record("container", {example}).add("children", [
      record("canvas/root", {sort: 1, width: 160, height: 140, example}).add("children", [
        record("triangle", {sort: 1, x: 80, y: 10, side: 100, fillStyle: "rgb(74, 64, 136)"}),
        record("triangle", {sort: 2, x: 80, y: 32, side: 60, fillStyle: "rgb(91, 89, 164)"}),
        record("triangle", {sort: 3, x: 80, y: 54, side: 20, fillStyle: "rgb(107, 103, 173)"}),
        record("triangle", {sort: 4, x: 80, y: 10, side: 50, strokeStyle: "rgb(0, 184, 241)", lineWidth: 2}),
        record("triangle", {sort: 4, x: 55, y: 53.5, side: 50, strokeStyle: "rgb(0, 184, 241)", lineWidth: 2}),
        record("triangle", {sort: 4, x: 105, y: 53.5, side: 50, strokeStyle: "rgb(0, 184, 241)", lineWidth: 2}),
      ])
    ])
  ];
});

prog.commit("Create a record to keep track of where we're at in our animation.", ({record}) => {
  return [
    record("animated-circle", {frame: 0, prev: 0})
  ]
});

prog.commit("When a container for an animated circle is hovered, allow its frame to update with the timer.", ({find}) => {
  let timer = find("animation-timer");
  let animated = find("animated-circle");
  // A container for this animated circle is hovered.
  find("html/element", "html/hovered", {class: "container", animated});
  animated.frame != timer.frame;
  return [
    animated.remove("frame").add("frame", timer.frame)
  ];
})

prog.block("Draw an animated pulsing ball.", ({find, lib:{math}, choose, record}) => {
  let example = "Animated (hover me!)";
  //let timer = find("animation-timer");
  let animated = find("animated-circle");
  let step = math.mod(animated.frame, 100);
  let [size] = choose(
    () => { step <= 50; return step; },
    () => 100 - step
  );
  let radius = 20 + size / 50 * 30;
  return [
    record("container", "html/listener/hover", {example, animated}).add("children", [
      record("canvas/root", {sort: 1, width: 160, height: 140, example, animated}).add("children", [
        record("canvas/path", {sort: 1, fillStyle: "rgb(0, 184, 241)", example, animated}).add("children", [
          record({sort: 1, type: "ellipse", x: 80, y: 70, radiusX: radius, radiusY: radius, rotation: 0, startAngle: 0, endAngle: 2 * 3.14, anticlockwise: "false"})
        ]),
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
      .container { flex: 0 0 auto; margin: 20; padding: 20; padding-top: 0; width: 200; height: 202; background: white; border-radius: 3px;  box-shadow: 0 3px 4px rgba(0, 0, 0, 0.1); }
      .container > div { margin: 10 0; text-align: center; }
    `})
  ];
})

// Add a timer for the animation example.
// @NOTE: Make sure to input something here.
//        Due to a minor implementation issue, input needs to be triggered at least once for the program to execute.
let inputs = appendAsEAVs([], {tag:["animation-timer", "system/timer"], resolution:33.333333333333})
prog.inputEavs(inputs);
