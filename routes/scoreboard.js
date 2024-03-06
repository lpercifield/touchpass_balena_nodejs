var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.render("scoreboard", { title: "ScoreBoard" });
});
router.get("/subscribe", (req, res) => {
  // ...

  let counter = 0;
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Send a message on connection
  res.write("event: connected\n");
  res.write(`data: You are now subscribed!\n`);
  res.write(`id: ${counter}\n\n`);
  counter += 1;
  var event = req.app.get("event");
  event.on("socket-data", function (data) {
    console.log("data: "+JSON.stringify(data));
    res.write("event: message\n");
    res.write(`data: ${JSON.stringify(data)}\n`);
    res.write(`id: ${counter}\n\n`);
    counter += 1;
  });

  // Send a subsequent message every five seconds
  // setInterval(() => {
  //     res.write('event: message\n');
  //     res.write(`data: ${new Date().toLocaleString()}\n`);
  //     res.write(`id: ${counter}\n\n`);
  //     counter += 1;
  // }, 1000);

  // Close the connection when the client disconnects
  req.on("close", () => res.end("OK"));
});

module.exports = router;
