const io = require("socket.io")();
var app = require("./app");
var event = app.get("event");

const socketapi = {
  io: io,
};

// Add your socket.io logic here!
io.on("connection", function (socket) {
  console.log("A user connected");
  socket.on("game-reset", function (message) {
    console.log("reset called");
    event.emit("game-reset");
    io.emit("gameReset", true);
  });
  socket.on("capture-video", function (message) {
    event.emit("capture-video",message);
  });
});
// io.on("game-reset", function (socket) {
//   console.log("reset called");
//   event.emit("game-reset");
// });
// io.on("message", function (socket) {
//   console.log("got socket message");
//   event.emit("game-reset");
// });

// end of socket.io logic
event.on("timer-tick", function (data) {
  //console.log("data: " + JSON.stringify(data));
  io.emit("timerTick", data);
});
event.on("share-url", function (data) {
  //console.log("data: " + JSON.stringify(data));
  io.emit("shareURL", data);
});

event.on("video-status", function (data) {
  //console.log("data: " + JSON.stringify(data));
  io.emit("videoStatus", data);
});

event.on("udpSocket-data", function (data) {
  //console.log("data: " + JSON.stringify(data));
  io.emit("data", JSON.stringify(data));
});

module.exports = socketapi;
