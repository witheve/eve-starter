import {Program} from "witheve";

let prog = new Program("clock");
prog.attach("system");
prog.attach("svg");

prog.bind("draw a clock", ({find, record}) => {
  let timer = find("clock-timer");
  return [
    record("svg/root", {viewBox: "0 0 100 100", width: "300px", timer}).add("children", [
      record("svg/circle", {sort: 1, cx:50, cy:50, r:45, fill:"#0b79ce"}),
      record("clock-hand", "hour-hand", {sort: 2, timer, length:30, stroke:"black"}).add("degrees", 30 * timer.hour),
      record("clock-hand", "minute-hand", {sort: 3, timer, length:40, stroke:"black"}).add("degrees", 6 * timer.minute),
      record("clock-hand", "second-hand", {sort: 4, timer, length:40, stroke:"red"}).add("degrees", 6 * timer.second),
    ])
  ]
})

prog.bind("draw clock hands", ({find, lib}) => {
  let {math} = lib;
  let hand = find("clock-hand");
  let x2 = 50 + hand.length * math.sin(hand.degrees)
  let y2 = 50 - hand.length * math.cos(hand.degrees)
  return [
    hand.add("tag", "svg/line")
        .add("x1", 50)
        .add("y1", 50)
        .add("x2", x2)
        .add("y2", y2)
  ]
})

prog.inputEAVs([
  [1, "tag", "clock-timer"],
  [1, "tag", "system/timer"],
  [1, "resolution", 1000],
]);
