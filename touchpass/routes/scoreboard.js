var express = require("express");
var router = express.Router();

const { getSdk } = require('balena-sdk');

const balena = getSdk({
  apiUrl: "https://api.balena-cloud.com/"
});
var publicURL;

(async () => {
  await balena.auth.loginWithToken(process.env.BALENA_API_KEY);
  await balena.models.device.getDeviceUrl(process.env.BALENA_DEVICE_UUID).then(function (url) {
    //console.log(url);
    publicURL = url;
  });
})();



/* GET users listing. */
router.get("/", function (req, res, next) {
  // console.log(randomKey);
  res.render("scoreboard", { title: "Quikick ScoreBoard",publicURL });

});


module.exports = router;
