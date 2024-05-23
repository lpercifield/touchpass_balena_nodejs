var app = require("./app");
var events = app.get("event");
const dgram = require("dgram");
const socket = dgram.createSocket("udp4");
const message = "Server?";
//const deviceArray = [13456292, 5867696, 13505620, 13475596, 13455872, 13458656];
const deviceArray = [13456292];
// const jsonArray = [
//   { activeId: 13456292, nextId: 5867696 },
//   { activeId: 5867696, nextId: 13456292 },
//   { activeId: 13456292, nextId: 5867696 },
//   { activeId: 5867696, nextId: 13456292 },
//   { activeId: 13456292, nextId: 5867696 },
//   { activeId: 5867696, nextId: 13456292 },
// ];

var numDevices = deviceArray.length;
var counter = 0;

var activeTarget = 3;
var nextTarget = 3;
var gameScore = 0;
var numTargets = 1;

function generateRandomActiveNext(min, max) {
  //var num = Math.floor(Math.random() * (max - min + 1)) + min;
  // run this loop until activeTarget is different than nextTarget
  if (min !== max) {
    do {
      activeTarget = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (activeTarget === nextTarget);

    // run this loop until nextTarget is different than activeTarget
    do {
      nextTarget = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (nextTarget === activeTarget);
  } else {
    activeTarget = min;
    nextTarget = max;
  }
}
function generateRandomNext(min, max) {
  if (min !== max) {
    // run this loop until nextTarget is different than activeTarget
    do {
      nextTarget = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (nextTarget === activeTarget);
  }else{
    nextTarget = max;
  }
}
generateRandomActiveNext(0, numDevices-1);

events.addListener("game-reset", function () {
  console.log("resetting game");
  gameScore = 0;
});

socket.on("listening", function () {
  const address = socket.address();
  console.log(
    "UDP socket listening on " + address.address + ":" + address.port
  );
  socket.setBroadcast(true);
  // setInterval(() => {
  //   socket.send(message, 0, message.length, 1234, "255.255.255.255");
  // }, 5000);
});

socket.on("message", function (message, remote) {
  console.log(
    "SERVER RECEIVED:",
    remote.address + ":" + remote.port + " - " + message
  );
  try {
    var receivedJson = JSON.parse(message.toString());
    //console.log(receivedJson.count);
    // expected output: 42
    // console.log(receivedJson.result);
    // expected output: true
    if (receivedJson.goal === 1) {
      gameScore++;
      var sharedJson = {};
      sharedJson.score = gameScore;
      sharedJson.reactTime = receivedJson.reactTime;
      events.emit("socket-data", sharedJson);
      activeTarget = nextTarget;
      generateRandomNext(0, numDevices - 1);
    }
    const response = JSON.stringify({
      activeId: deviceArray[activeTarget],
      nextId: deviceArray[nextTarget],
    });
    console.log("Sending: " + response);
    //const response = "Hellow there!";
    socket.setBroadcast(true);
    socket.send(response, 0, response.length, remote.port, "255.255.255.255");
  } catch (e) {
    console.log(e);
    // expected output: SyntaxError: Unexpected token o in JSON at position 1
  }

  //var responseJson = {"activeId":13456262,"nextId":87654321};
});
// app.on("listening", function () {
//   // server ready to accept connections here
//   var io = app.get("socketio");
//   console.log(io)
// });

socket.bind("4321");
