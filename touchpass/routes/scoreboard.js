var express = require("express");
var router = express.Router();
console.log("Scoreboard.js Route")
var publicURL = null;

const { getSdk } = require('balena-sdk');

const balena = getSdk({
  apiUrl: "https://api.balena-cloud.com/"
});

const fetchURL = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1000); // Set a 1 second timeout
  const signal = controller.signal;

  console.log("Getting Public URL");
  try {
    // Pass the signal to the task, or rely on AbortSignal.timeout in compatible operations
    //const result = await longRunningTask(controller.signal);
    console.log("Before calling BALENA SDK");
    
    await balena.auth.loginWithToken(process.env.BALENA_API_KEY,{ signal });
    await balena.models.device.getDeviceUrl(process.env.BALENA_DEVICE_UUID,{ signal }).then(function (url) {
      console.log("public URL",url);
      clearTimeout(timeoutId); // Clear timeout if task finishes first
      //publicURL = url;
      return url;
    });
  } catch (error) {
    clearTimeout(timeoutId); // Clear timeout on error too
    if (error.name === 'AbortError') {
      console.error('Task cancelled due to timeout')
      return null;
    } else {
      console.error('Task failed:', error.message)
      return null;
    }
  }

};

router.get('/', async (req, res, next) => {
  publicURL = await fetchURL(); // Your async function call
  res.render("scoreboard", { title: "Quikick ScoreBoard", publicURL });
});

/* GET users listing. */
// router.get("/", function (req, res, next) {
//   // console.log(randomKey);
//   res.render("scoreboard", { title: "Quikick ScoreBoard",publicURL });

// });


module.exports = router;
