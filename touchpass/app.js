require('dotenv').config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

//const net = require("net");

var app = express();

var e = require("events");
var events = new e.EventEmitter();
app.set("event", events);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var scoreboardRouter = require("./routes/scoreboard");
var leaderboardRouter = require("./routes/leaderboard");

const users = require("./user.js");

const { getSdk } = require('balena-sdk');

const balena = getSdk({
  apiUrl: "https://api.balena-cloud.com/"
});
var publicURL;

(async () => {
  await balena.auth.loginWithToken(process.env.BALENA_API_KEY);
  await balena.models.device.getDeviceUrl(process.env.BALENA_DEVICE_UUID).then(function (url) {
    //console.log(url);
    publicURL = url+"/select-player";
  });
})();





// var io = app.get("socketio");



app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
//app.use("/scoreboard", scoreboardRouter);
app.use("/leaderboard", leaderboardRouter);

var fs = require('fs');
var allUsersJson = "";
//var allUsers = JSON.parse(fs.readFileSync('allusersupdated.json', 'utf8'));

// Route to render the select player form
app.get('/select-player', (req, res) => {
  users.getAllUsers(function (allUsers) {
    //console.log(allUsers);
    allUsersJson = allUsers;
    const teams = [...new Set(allUsers.map(player => player.Metadata.team))];
    res.render('select-player', { teams, allUsers });
  });
});

// Route to handle form submission and display player record
app.post('/select-player', (req, res) => {
  const { team, number } = req.body;
  //const player = players.find(p => p.team === team && p.number === parseInt(number));
  res.redirect(`/dashboard?player=${number}`);
});

app.post('/start-game', (req, res) => {
  const gamePlayer = req.body.value;
  const gameType = req.body.type;
  console.log("START GAME", gamePlayer);
  console.log("TYPE", gameType);
  events.emit("user-data", gamePlayer);
  users.getUserHighScore(gamePlayer.UserID, function (scores) {
    //console.log(scores);
    events.emit("user-score-data", scores);
    events.emit("game-reset",+gameType);
  })
  // const { team, number } = req.body;
  // //const player = players.find(p => p.team === team && p.number === parseInt(number));
  // res.redirect(`/dashboard?player=${number}`);
  res.end();
});

/* GET users listing. */
app.get("/scoreboard", function (req, res, next) {
  // console.log(randomKey);
  res.render("scoreboard", { title: "Quikick ScoreBoard",publicURL });

});


// Route to render the dashboard
app.get('/dashboard', (req, res) => {
  const playerNumber = req.query.player;
  users.getUserHighScore(playerNumber, function (gameData) {
    //const playerGames = gameStates.filter(game => game.player === playerNumber);
    if (allUsersJson == "") {
      console.log("Getting all users");
      users.getAllUsers(function (allUsers) {
        //console.log(allUsers);
        allUsersJson = allUsers;
        const player = allUsersJson.find(p => p.UserID === playerNumber);
        //console.log(player);
        res.render('dashboard', { gameStates: gameData, player });
      });
    } else {
      const player = allUsersJson.find(p => p.UserID === playerNumber);
      console.log(player);
      res.render('dashboard', { gameStates: gameData, player });
    }

  })

});

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
