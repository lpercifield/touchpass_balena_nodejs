//C3501325244049 - The socket address for USB connections is 172.2X.1YZ.51:8080 where XYZ are the last three digits of the camera's serial number
//172.20.149.51
// const request = require("request");

// const options = {
//   method: "GET",
//   url: "http://172.20.149.51:8080/gopro/camera/analytics/set_client_info",
// };

// request(options, function (error, response, body) {
//   if (error) throw new Error(error);

//   console.log(body);
// });

const request = require("request");
const http = require("http"); // or 'https' for https:// URLs
const https = require("https");
const fs = require("fs");
//var ffmpeg = require("ffmpeg");
var ffmpeg = require("fluent-ffmpeg");
var startTime;

//createNewWatermark();
enableUSB();
setResolution();
setFramerate();
startRecording(function () {
  console.log("recording started");
  setTimeout(() => {
    stopRecording(function () {
      setTimeout(() => {
        getLastCaptureName(function (fileData) {
          downloadFile(fileData, function (video) {
            uploadFile(video);
            //addTextOverlay(video, "Cool Text Overlay");
          });
        });
      }, 2000);
    });
  }, 5000);
});
//testing("GX010021.MP4");
// getLastCaptureName(function (fileData) {
//   downloadFile(fileData);
// });

function enableUSB() {
  const options = {
    method: "GET",
    url: "http://172.20.149.51:8080/gopro/camera/control/wired_usb",
    qs: { p: "1" },
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log("enableUSB"+body);
  });
}
function setFramerate() {
  const options = {
    method: "GET",
    url: "http://172.20.149.51:8080/gopro/camera/setting",
    qs: { option: "1", setting: "3" },
    // 0 = 240, 1 = 120, 2 = 100;
    //https://gopro.github.io/OpenGoPro/http#tag/settings/operation/GPCAMERA_CHANGE_SETTING::3
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log("setFramerate"+body);
  });
}
function setResolution() {
  const options = {
    method: "GET",
    url: "http://172.20.149.51:8080/gopro/camera/setting",
    qs: { option: "9", setting: "2" },
    //https://gopro.github.io/OpenGoPro/http#tag/settings/operation/GPCAMERA_CHANGE_SETTING::2
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log("setResolution"+body);
  });
}
function startRecording(callback) {
  const options = {
    method: "GET",
    url: "http://172.20.149.51:8080/gopro/camera/shutter/start",
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log("startRecording" + body);
    //startTime = Date.now();
    return callback();
  });
}
function stopRecording(callback) {
  const options = {
    method: "GET",
    url: "http://172.20.149.51:8080/gopro/camera/shutter/stop",
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log("stopRecoring"+body);
    //console.log(Date.now() - startTime);
    return callback();
  });
}
function getLastCaptureName(callback) {
  const options = {
    method: "GET",
    url: "http://172.20.149.51:8080/gopro/media/last_captured",
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    var obj = JSON.parse(body);
    console.log(obj.folder);
    return callback(obj);
  });
}
function downloadFile(fileData, callback) {
  // const options = {
  //   method: "GET",
  //   url: "http://172.20.149.51:8080/videos/DCIM/100GOPRO/%7Bfilename%7D",
  // };

  // request(options, function (error, response, body) {
  //   if (error) throw new Error(error);

  //   console.log(body);
  // });
  const file = fs.createWriteStream(fileData.file);
  const request = http.get(
    "http://172.20.149.51:8080/videos/DCIM/" +
      fileData.folder +
      "/" +
      fileData.file,
    function (response) {
      response.pipe(file);

      // after download completed close filestream
      file.on("finish", () => {
        file.close();
        console.log("Download Completed");
        return callback(fileData.file);
      });
    }
  );
}
function addWatermark(image, video) {
  try {
    var process = new ffmpeg(video);
    var outputFilename = "touchpass_" + Date.now() + ".mp4";
    process.then(
      function (video) {
        // Callback mode
        video.addCommand(
          "-vf",
          "drawtext=text='My text starting at 640x360':x=640:y=360:fontsize=24:fontcolor=red"
        );
        video.addFilterComplex(
          "drawtext=text='My text starting at 640x360':x=640:y=360:fontsize=24:fontcolor=red"
        );
        video.fnAddWatermark(
          image,
          outputFilename,
          {
            position: "C",
          },
          function (error, file) {
            if (!error) {
              console.log("New video file: " + file);
            } else {
              console.log(error);
            }
          }
        );
      },
      function (err) {
        console.log("Error: " + err);
      }
    );
  } catch (e) {
    console.log(e.code);
    console.log(e.msg);
  }
}
function addTextWatermark(videoFile) {
  try {
    var process = new ffmpeg(videoFile);
    var outputFilename = "touchpass_" + Date.now() + ".mp4";
    process.then(
      function (video) {
        video
          .addCommand("-vf","drawtext=text='My text starting at 640x360':x=640:y=360:fontsize=24:fontcolor=red")
          .save(outputFilename, function (error, file) {
            if (!error) console.log("Video file: " + file);
          });
      },
      function (err) {
        console.log("Error: " + err);
      }
    );
  } catch (e) {
    console.log(e.code);
    console.log(e.msg);
  }
}
function addTextOverlay(videoPath,textToOverlay){
var outputFilename = "touchpass_" + Date.now() + ".mp4";
// make sure you set the correct path to your video file
var proc = ffmpeg(videoPath)
  .videoFilters({
    filter: "drawtext",
    options: {
      fontfile: "CourierNewBold.ttf",
      text: textToOverlay,
      fontsize: 90,
      fontcolor: "red",
      x: "(main_w/2-text_w/2)",
      y: "(main_h-main_h/5)",
      shadowcolor: "black",
      shadowx: 2,
      shadowy: 2,
    },
  })
  // setup event handlers
  .on("end", function () {
    console.log("file has been converted succesfully");
    uploadFile(outputFilename);
  })
  .on("error", function (err) {
    console.log("an error happened: " + err.message);
  })
  // save to file
  .save(outputFilename);
}
function uploadFile(filename){
  fs.readFile(filename, function (err, data) {
    const req = https.request(
      "https://content.dropboxapi.com/2/files/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ` + process.env.TOKEN,
          "Dropbox-API-Arg": JSON.stringify({
            path: "/Upload/touchpass_" + Date.now() + ".mp4",
            mode: "overwrite",
            autorename: true,
            mute: false,
            strict_conflict: false,
          }),
          "Content-Type": "application/octet-stream",
        },
      },
      (res) => {
        console.log("statusCode: ", res.statusCode);
        console.log("headers: ", res.headers);

        res.on("data", function (d) {
          process.stdout.write(d);
        });
      }
    );

    req.write(data);
    req.end();
  });
}
//
//drawtext=text='My text starting at 640x360':x=640:y=360:fontsize=24:fontcolor=white
// function createNewWatermark(){
//     var options = {
//       text: "watermark-test",
//       textSize: 6, //Should be between 1-8
//       opacity: 0.5, //Should be between 0.1 to 1
//       color: "#ffffff", //Should be hax code
//       dstPath: "watermark-jimp.png", //Path of destination image file
//       position: "center", //Should be 'top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'
//     };
//     watermark.addTextWatermark("watermark.png", options);
//}
