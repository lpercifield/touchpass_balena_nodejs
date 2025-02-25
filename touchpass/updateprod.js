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
    "10.42.0.133",
    "10.42.0.220",
    "10.42.0.77"
];
var counter = 0;
// print process.argv
// process.argv.forEach(function (val, index, array) {
//     console.log(index + ': ' + val);
//   });

var args = process.argv.slice(2);

function runUpdate(arrayToUse) {
    arduino.doUpdate(arrayToUse[counter], './arduino/' + args[0] + '.ino.bin', function () {
        console.log("Done: ", arrayToUse[counter]);
        counter++;
        //runUpdate();
        console.log(arrayToUse.length - counter)
        if ((arrayToUse.length - counter) > 0) {
            runUpdate(arrayToUse);
        }
    })
}
if (args[1] != null) {
    console.log(args);
    let ipArray = [];
    for (let i = 1; i < args.length; i++) {
        ipArray[i] = args[i];
      }
    runUpdate(ipArray);
} else {
    runUpdate(ipArray);
}

