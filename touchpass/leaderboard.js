var app = require("./app");
var events = app.get("event");
const users = require("./user.js");

console.log("starting leaderboard.js")

events.addListener("refresh-leaderboard", function (count) {
    console.log("added refresh-leaderboard listener",count)
    users.getLeaderboardData(count,function(scoreData){
        events.emit("leaderboard-data",scoreData);
        console.log("Emitting leaderboard data");
    })
})