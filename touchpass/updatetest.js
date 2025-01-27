const arduino = require("./arduino/updateESP32.js");
// const ipArray = [
//   "10.42.0.110",
//   "10.42.0.111",
//   "10.42.0.112",
//   "10.42.0.113",
//   "10.42.0.114",
//   "10.42.0.115",
// ];

// const ipArray = [
//   "10.42.0.206",
//   "10.42.0.12",
//   "10.42.0.220",
//   "10.42.0.65",
// ];

//RENO
const ipArray = [
  "10.42.0.120",
  "10.42.0.14",
  "10.42.0.111",
  "10.42.0.77",
  "10.42.0.220",
  "10.42.0.133"
];
// const ipArray = [
//   "10.42.0.14"
// ];

ipArray.forEach((element) =>
  arduino.doUpdate(element, './arduino/touch_pass_TEST_Quikick2.ino.bin', function () {
    console.log("Done");
  })
);
