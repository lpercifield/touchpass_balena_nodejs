var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var scoreboardRouter = require("./routes/scoreboard");

const dgram = require("dgram");
const socket = dgram.createSocket("udp4");
const message = "Server?";
const deviceArray = [13456292, 5867696, 13505620, 13475596, 13455872, 13458656];
const jsonArray = [
  { activeId: 13456292, nextId: 5867696 },
  { activeId: 5867696, nextId: 13456292 },
  { activeId: 13456292, nextId: 5867696 },
  { activeId: 5867696, nextId: 13456292 },
  { activeId: 13456292, nextId: 5867696 },
  { activeId: 5867696, nextId: 13456292 },
];
var counter = 0;

var numberOne = 3;
var numberTwo = 3;

const net = require("net");

var app = express();

var e = require("events");
var events = new e.EventEmitter();
app.set("event", events);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/scoreboard", scoreboardRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// const server = net.createServer((socket) => {
//   var buffer = "";
//   socket.on("data", (data) => {
//     let a;
//     try {
//       a = JSON.parse(data.toString());
//       //console.log(a);
//       events.emit("socket-data", a);
//       console.log("Received request: ", a);
//       socket.write("Hi, this is server response");
//     } catch (e) {
//       return console.error(e); // error in the above string (in this case, yes)!
//     }
//   });
//   socket.on("close", () => {
//     console.log("Connection closed");
//   });
//   socket.on("error", (error) => {
//     console.error("Socket error:", error);
//   });
// });
// server.listen(52275, "0.0.0.0");

function generateBothRandom(min, max) {
  //var num = Math.floor(Math.random() * (max - min + 1)) + min;
  // run this loop until numberOne is different than numberTwo
  do {
    numberOne = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (numberOne === numberTwo);

  // run this loop until numberTwo is different than numberOne
  do {
    numberTwo = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (numberTwo === numberOne);
}
function generateRandom(min, max) {
  // run this loop until numberTwo is different than numberOne
  do {
    numberTwo = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (numberTwo === numberOne);
}
generateBothRandom(0, 5);

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
    console.log(receivedJson.count);
    // expected output: 42
    console.log(receivedJson.result);
    // expected output: true
    if (receivedJson.goal === 1) {
      events.emit("socket-data", receivedJson);
      numberOne = numberTwo;
      generateRandom(0, 5);
    }
    const response = JSON.stringify({
      activeId: deviceArray[numberOne],
      nextId: deviceArray[numberTwo],
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

socket.bind("4321");

module.exports = app;
