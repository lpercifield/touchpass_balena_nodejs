var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var scoreboardRouter = require("./routes/scoreboard");
var leaderboardRouter = require("./routes/leaderboard");
require('dotenv').config();

//const net = require("net");

var app = express();

var e = require("events");
var events = new e.EventEmitter();
app.set("event", events);
// var io = app.get("socketio");

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
app.use("/leaderboard", leaderboardRouter);

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



module.exports = app;
