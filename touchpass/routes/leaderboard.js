var express = require("express");
var router = express.Router();


/* GET users listing. */
router.get("/", function (req, res, next) {
  res.render("leaderboard", { title: "Quikick Leader Board" });

});


module.exports = router;
