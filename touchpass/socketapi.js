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
  });
  socket.on("capture-video", function (message) {
    event.emit("capture-video",message);
  });
  socket.on("refresh-leaderboard", function(message){
    event.emit("refresh-leaderboard",message);
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
event.on("user-data", function (data) {
  //console.log("data: " + JSON.stringify(data));
  io.emit("userData", data);
});
event.on("new-user",function(data){
  io.emit("new-user",data);
})

event.on("game-reset", function (data) {
  //console.log("data: " + JSON.stringify(data));
  io.emit("gameReset", true,process.env.GAME_LENGTH);
});

event.on("user-score-data", function (data) {
  //console.log("data: " + JSON.stringify(data));
  io.emit("userScoreData", data);
});

event.on("leaderboard-data", function (data) {
  io.emit("leaderboard-data", data);
})
event.on("score-data", function (data) {
  //console.log("data: " + JSON.stringify(data));
  io.emit("scoreData", data);
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
