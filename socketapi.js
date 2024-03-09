const io = require("socket.io")();
var app = require("./app");
const socketapi = {
  io: io,
};

// Add your socket.io logic here!
io.on("connection", function (socket) {
  console.log("A user connected");
});

var event = app.get("event");
// end of socket.io logic

  event.on("socket-data", function (data) {
    //console.log("data: " + JSON.stringify(data));
    io.emit("data", JSON.stringify(data));
  });

module.exports = socketapi;