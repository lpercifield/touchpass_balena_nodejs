var app = require("./app");
var events = app.get("event");
const dgram = require("dgram");
const udpSocket = dgram.createSocket("udp4");
const request = require("request");
const http = require("http"); // or 'https' for https:// URLs
const https = require("https");
const fs = require("fs");
var ffmpeg = require("fluent-ffmpeg");
//import { refreshAccessToken } from "./lib/index.js";
const dropbox = require("./lib/dropboxRefreshToken.js");
const arduino = require("./arduino/updateESP32.js");
const { log } = require("console");
//const ipRange = "10.42.0.255";
const ipRange = process.env.BROADCAST_ADDRESS;
var HID = require('node-hid');
var devices = HID.devices();

var nfcBuffs = ''
var activeUser = null;
var buffsCount = 0
var keymap = {'04':'A','05':'B','06':'C','07':'D','08':'E','09':'F','0a':'G','0b':'H','0c':'I','0d':'J','0e':'K','0f':'L','10':'M','11':'N','12':'O','13':'P','14':'Q','15':'R','16':'S','17':'T','18':'U','19':'V','1a':'W','1b':'X','1c':'Y','1d':'Z','1e':'1','1f':'2','20':'3','21':'4','22':'5','23':'6','24':'7','25':'8','26':'9','27':'0','00':''}


try {
  var reader = new HID.HID(0x413d,0x2107);// PID: 0x2107 VID: 0x413d
  reader.on("data", function(data) { 
    buffsCount+=1
    //console.log("DATA: ",data)
    var nfcBuf = Buffer.from([data[2]]);
    if (nfcBuf.toString('hex') == '28') {
      cardId = nfcBuffs;
      console.log("CARD ID:",cardId); 
      getUserData(cardId);
      nfcBuffs = [] // and reset counter/buffer
      buffsCount = 0
    } else if (nfcBuf.toString('hex') != '00') {
      nfcBuffs += keymap[nfcBuf.toString('hex')]
    }
  });
} catch (error) {
  console.log(error)
}
const parser = require('mag-stripe');
const users = require("./user.js");


// import {
//   getFreshSLAccessTokenFromRefreshToken
// } from "./steps/dropboxStepsHelper.js";
// import {
//   refreshAccessToken,
// } from "../lib/index.js";

//createNewWatermark();

//5882560, 5880508, 5775764, 5880848, 5880456, 5878116;

//{"activeId":"5880848","nextId":"5880508"}
//{"deviceId":5867695,"goal":1,"reactTime":0} {"deviceId":5875620,"goal":1,"reactTime":0}
//sudo ln -sf ./cypress/cyfmac43455-sdio-minimal.bin brcmfmac43455-sdio.bin
//brcmfmac43455-sdio.bin -> ../cypress/cyfmac43455-sdio.bin

/*
https://forums.balena.io/t/how-can-i-configure-tp-link-wifi-adapter/65176/9
https://docs.balena.io/learn/develop/multicontainer/#labels
*/

//order: 5880456,5775764,5880508,5882560,5878116,5880848
//BEACON: 5880456,5880848,5878116,5882560,5880508,5775764
//RENO: 5875620,5807792,5867696,5799664,5806000,5800040 -- 5875620,5807792,5800040,5806000,5867696,5799664

//5875620,5807792,5800040,5806000,5867696,5799664


const message = "Server?";
//const deviceArray = [13456292, 5867696, 13505620, 13475596, 13455872, 13458656];
//const deviceArray = [13456292, 5806000, 5800040];
const deviceArray = process.env.DEVICE_ARRAY.split(",");

const teamsArray = process.env.TEAM_ARRAY.split(",");
// const jsonArray = [
//   { activeId: 13456292, nextId: 5867696 },
//   { activeId: 5867696, nextId: 13456292 },
//   { activeId: 13456292, nextId: 5867696 },
//   { activeId: 5867696, nextId: 13456292 },
//   { activeId: 13456292, nextId: 5867696 },
//   { activeId: 5867696, nextId: 13456292 },
// ];


//{"userID":"24ac00cc-ea4b-4c62-a893-0c0d521eea86","locationID":"1","gameName":"1","score":-2,"duration":90,"device":"1","metadata":{}}

var numDevices = deviceArray.length;
var counter = 0;
console.log(deviceArray.toString());
//console.log(devices);
var activeTarget = 3;
var nextTarget = 3;
var gameScore = 0;
var targetCounter = 0;
var reactionTimes = [];
//var gameLength = 90;
var timerSeconds = process.env.GAME_LENGTH;
var numTargets = deviceArray.length;
var gameTimer = new Interval(gameTick, 1000);
var captureVideo = false;
var gameOver = false;
var savedGame = false;
var animateInterval;
var isRecording = false;
var gameMode = 0; // RIGHT, LEFT, Random
var ackCounter = 0;
var ackTimeout = null;

// users.getHighScore(function(data){
//   console.log(data)
//   events.emit("score-data", data);
// })

var isDarwin = process.platform === "darwin";
if(isDarwin){
process.stdin.resume();

process.stdin.on('data', (data) => {
  const input = data.toString().trim();
  //console.log('You entered:', input);
  console.log("CARD ID:",input); 
  getUserData(input);

});

console.log('Enter some text and press Enter:');

}

function getUserData(card){
  users.getUserByCard(card,function(usersFound){
    console.log("usersFound",usersFound.foundUser);
    if(usersFound.foundUser != null){
      console.log(usersFound.foundUser.UserID);
      activeUser = usersFound.foundUser;
      events.emit("user-data", activeUser);
      users.getUserHighScore(usersFound.foundUser.UserID,function(scores){
        //console.log(scores);
        events.emit("user-score-data", scores);
        events.emit("game-reset");
      })
    }else{
      console.log("NO USER FOUND")
      var newUserObj = {}
      newUserObj.card = card
      newUserObj.teams = teamsArray;
      console.log(newUserObj);
      // Object.keys(jsonData).forEach(function (key) {

      // })
      events.emit("new-user",newUserObj);
      //createUser(card);
    }

  });
}

function createUser(message){
  users.addUser(message,function(data){
    if(data){
      getUserData(message.cardId);
    }
  })
}

function generateRandomActiveNext(min, max) {
  //var num = Math.floor(Math.random() * (max - min + 1)) + min;
  // run this loop until activeTarget is different than nextTarget
  if (min !== max) {
    do {
      activeTarget = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (activeTarget === nextTarget);

    // run this loop until nextTarget is different than activeTarget
    do {
      nextTarget = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (nextTarget === activeTarget);
  } else {
    activeTarget = min;
    nextTarget = max;
  }
}
function generateRandomNext(min, max) {
  if (min !== max) {
    // run this loop until nextTarget is different than activeTarget
    do {
      nextTarget = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (nextTarget === activeTarget);
  } else {
    nextTarget = max;
  }
}
// generateRandomActiveNext(0, numDevices - 1);

events.addListener("save-user", function (message) {
  createUser(message);
})

events.addListener("game-reset", function () {
  console.log("resetting game");
  gameScore = 0;
  gameTimer.stop();
  gameOver = false;
  timerSeconds = process.env.GAME_LENGTH;
  reactionTimes = [];
  gameMode = 0;
  generateGameColors();
  sendUDPMessage();
  if (isRecording) {
    stopRecording();
  }
  users.getHighScore(function(data){
    //console.log(data)
    events.emit("score-data", data);
  })
});
events.addListener("capture-video", function (message) {
  console.log("Setting Capture Video: ", message);
  captureVideo = message;
  if (captureVideo) {
    enableUSB();
    setResolution();
    setFramerate();
  }
});

function sendUDPMessage(message, port) {
  try {
    console.log("Active Target", activeTarget);
    console.log("Next Target", nextTarget);
    const responseJson = JSON.stringify({
      messageType: 1,
      activeId: deviceArray[activeTarget],
      nextId: deviceArray[nextTarget],
    });
    console.log("Sending: " + responseJson + "to port - " + "4432");
    //const response = "Hellow there!";
    udpSocket.setBroadcast(true);
    udpSocket.send(responseJson, 0, responseJson.length, "4432", ipRange);
  } catch (e) {
    console.log(e);
    // expected output: SyntaxError: Unexpected token o in JSON at position 1
  }
}
function animateColors(maxAnimations, callback) {
  var counter = 0;
  var counterNext = 1;
  var totalAnimations = 0;
  console.log("Starting Animation");
  animateInterval = setInterval(function () {
    //generateRandomNext(0, numDevices - 1);
    const animateresponse = JSON.stringify({
      activeId: deviceArray[counter],
      nextId: deviceArray[counterNext],
    });
    counter++;
    counterNext++;
    if (counter > numDevices - 1) {
      counter = 0;
    }
    if (counterNext > numDevices - 1) {
      counterNext = 0;
    }
    console.log("counter", counter);
    console.log("Sending: " + animateresponse + "to port - " + "4432");
    //const response = "Hellow there!";
    udpSocket.setBroadcast(true);
    udpSocket.send(animateresponse, 0, animateresponse.length, "4432", ipRange);
    totalAnimations++;
    if (totalAnimations === maxAnimations) {
      clearInterval(animateInterval);
      return callback();
    }
  }, 500);
}
function generateGameColors() {
  switch (gameMode) {
    case 2: // RANDOM
      activeTarget = deviceArray[0];
      generateRandomNext(0, numDevices - 1);
      break;
    case 0: // To the RIGHT
      activeTarget = 0;
      nextTarget = 1;
      targetCounter = 1;
      break;
    case 1: // To the LEFT
      activeTarget = 0;
      nextTarget = numDevices - 1;
      targetCounter = numDevices - 1;
      break;
  }
}

udpSocket.on("listening", function () {
  const address = udpSocket.address();
  console.log(
    "UDP udpSocket listening on " + address.address + ":" + address.port
  );
  udpSocket.setBroadcast(true);
  // setInterval(() => {
  //   udpSocket.send(message, 0, message.length, 1234, "255.255.255.255");
  // }, 5000);
});

udpSocket.on("message", function (message, remote) {
  console.log(
    "SERVER RECEIVED:",
    remote.address + ":" + remote.port + " - " + message
  );
  try {
    var receivedJson = JSON.parse(message.toString());
    //console.log(receivedJson.count);
    // expected output: 42
    // console.log(receivedJson.result);
    // expected output: true
    if (receivedJson.goal === 1 && !gameOver) {
      reactionTimes.push(receivedJson.reactTime);
      if (!gameTimer.isRunning()) {
        gameTimer.start();
      }
      if (!gameOver) {
        gameScore++;
        console.log("GameScore: ",gameScore);
        if (gameMode === 0 && gameScore === numDevices-1) {
          targetCounter = numDevices - 1;
          gameMode = 1;
          console.log("Game Mode: ",gameMode);
          console.log("targetCounter: ",targetCounter);
        }
        if (gameMode === 1 && gameScore === (numDevices*2)-1) {
          gameMode = 2;
          console.log("Game Mode: ",gameMode);
          console.log("targetCounter: ",targetCounter);
        }
      }
      var sharedJson = {};
      sharedJson.score = gameScore;
      sharedJson.reactTime = receivedJson.reactTime;
      events.emit("udpSocket-data", sharedJson);
      activeTarget = nextTarget;
      switch (gameMode) {
        case 2:
          generateRandomNext(0, numDevices - 1);
          break;
        case 0:
          targetCounter++;
          if (targetCounter === numDevices) {
            targetCounter = 0;
          }
          nextTarget = targetCounter;
          break;
        case 1:
          targetCounter--;
          if (targetCounter < 0) {
            targetCounter = numDevices - 1;
          }
          nextTarget = targetCounter;
          break;
      }
    }else if(receivedJson.goal === 1 && gameOver){
      events.emit("timer-tick", 0);
    }
    if (receivedJson.ack === 1) {
      console.log("ACK: ", receivedJson.deviceId);
      //ackCounter++;
      if (ackTimeout) {
        //console.log("clearing resend interval");
        clearInterval(ackTimeout);
        ackTimeout = null;
      }
    } else {
      sendUDPMessage();
      if (ackTimeout === null) {
        //console.log("setting resend interval")
        ackTimeout = setInterval(function () {
          // if(ackCounter<2){
          console.log("Not enough ACKs");
          sendUDPMessage();
          // }
        }, 500);
      }
    }

    // const response = JSON.stringify({
    //   activeId: deviceArray[activeTarget],
    //   nextId: deviceArray[nextTarget],
    // });
    // console.log("Sending: " + response + "to port - " + remote.port);
    // //const response = "Hellow there!";
    // udpSocket.setBroadcast(true);
    // udpSocket.send(response, 0, response.length, remote.port, ipRange);
  } catch (e) {
    console.log(e);
    // expected output: SyntaxError: Unexpected token o in JSON at position 1
  }

  //var responseJson = {"activeId":13456262,"nextId":87654321};
});
// app.on("listening", function () {
//   // server ready to accept connections here
//   var io = app.get("socketio");
//   console.log(io)
// });

udpSocket.bind("4321");
udpSocket.on("listening", function () {
  //sendUDPMessage();
  console.log("Listeneing");
  // animateColors(6, function () {
  //   setTimeout(function () {
  //     generateGameColors();
  //     sendUDPMessage();
  //   }, 1000);
  // });
  setTimeout(function () {
    generateGameColors();
    sendUDPMessage();
  }, 1000);
  // generateGameColors();
  // sendUDPMessage();
  // setTimeout(function(){
  //   clearInterval(animateInterval);
  // },15000)
});

//

function gameTick() {
  if (timerSeconds === 0 && !gameOver) {
    // fetch("/scoreboard/reset", {
    //   method: "GET", // default, so we can ignore
    // });
    console.log("Active User",activeUser);
    gameTimer.stop();
    gameOver = true;
    var gameObj = {}; //{"userID":"24ac00cc-ea4b-4c62-a893-0c0d521eea86","locationID":"1","gameName":"1","score":-2,"duration":90,"device":"1","metadata":{}}
    gameObj.userID = activeUser.UserID;
    gameObj.locationID = process.env.LOCATION;;
    gameObj.gameName = numDevices.toString();
    gameObj.duration = process.env.GAME_LENGTH;
    gameObj.device = process.env.BALENA_DEVICE_NAME_AT_INIT;
    gameObj.metadata = {"reactionTimes":reactionTimes}; //{"data":"test"}
    gameObj.score = gameScore*-1;
    console.log(gameObj)
    users.addGame(gameObj,function(data){
      //console.log(data);
      events.emit("refresh-leaderboard",5);
    })
    //animateColors();
    // setTimeout(function () {
    //   clearInterval(animateInterval);
    //   const response = JSON.stringify({
    //     activeId: deviceArray[activeTarget],
    //     nextId: deviceArray[nextTarget],
    //   });
    //   console.log("Sending: " + response + "to port - " + "4432");
    //   udpSocket.setBroadcast(true);
    //   udpSocket.send(response, 0, response.length, "4432", "10.42.0.255");
    // }, 5000);
  } else if(!gameOver){
    timerSeconds--;
    events.emit("timer-tick", timerSeconds);
  }
  if (captureVideo) {
    var startVideoSeconds = process.env.VIDEO_LENGTH / 1000 - 5;
    if (timerSeconds <= startVideoSeconds && timerSeconds > 0 && !isRecording) {
      isRecording = true;
      startRecording(function () {
        console.log("recording started");
        setTimeout(() => {
          stopRecording(function () {
            setTimeout(() => {
              getLastCaptureName(function (fileData) {
                downloadFile(fileData, function (video) {
                  events.emit("video-status", "video uploading");
                  uploadFile(video);
                  isRecording = false;
                  //addTextOverlay(video, "Cool Text Overlay");
                });
              });
            }, 2000);
          });
        }, process.env.VIDEO_LENGTH);
      });
    }
  }

  //"timer-tick";
 
}

function Interval(fn, time) {
  var timer = false;
  this.start = function () {
    if (!this.isRunning()) timer = setInterval(fn, time);
  };
  this.stop = function () {
    clearInterval(timer);
    timer = false;
  };
  this.isRunning = function () {
    return timer !== false;
  };
}

//testing("GX010021.MP4");
// getLastCaptureName(function (fileData) {
//   downloadFile(fileData);
// });

//GOPROSUFFF

function enableUSB() {
  const options = {
    method: "GET",
    url: "http://172.20.149.51:8080/gopro/camera/control/wired_usb",
    qs: { p: "1" },
  };

  request(options, function (error, response, body) {
    if (error) {
      console.log("Enable USB Error: ", error);
    }

    console.log("enableUSB" + body);
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
    if (error) {
      console.log("Framerate Error: ", error);
    }

    console.log("setFramerate" + body);
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
    if (error) {
      console.log("Set Resolution Error: ", error);
    }

    console.log("setResolution" + body);
  });
}
function startRecording(callback) {
  const options = {
    method: "GET",
    url: "http://172.20.149.51:8080/gopro/camera/shutter/start",
  };

  request(options, function (error, response, body) {
    if (error) {
      console.log("Start Recording Error: ", error);
    }

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
    if (error) {
      console.log("Stop Recording Error: ", error);
    }

    console.log("stopRecoring" + body);
    //console.log(Date.now() - startTime);
    if (callback) {
      return callback();
    }
  });
}
function getLastCaptureName(callback) {
  const options = {
    method: "GET",
    url: "http://172.20.149.51:8080/gopro/media/last_captured",
  };

  request(options, function (error, response, body) {
    if (error) {
      console.log("Get Last Capture Error: ", error);
    }
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
  request.on("error", function (error) {
    //if (error) {
    console.log("Download File Error: ", error);
    //}
  });
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
          .addCommand(
            "-vf",
            "drawtext=text='My text starting at 640x360':x=640:y=360:fontsize=24:fontcolor=red"
          )
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
function addTextOverlay(videoPath, textToOverlay) {
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

function uploadFile(filename) {
  dropbox
    .refreshAccessToken(
      process.env.REFRESH_TOKEN,
      process.env.DB_KEY,
      process.env.DB_SECRET
    )
    .then((resultToken) => {
      console.log("Have DB Key - upload starting");
      var uploadPath = "/Upload/touchpass_" + Date.now() + ".mp4";
      var stats = fs.statSync(filename);
      var fileSizeInBytes = stats.size;
      var bytes = 0;
      var readStream = fs.createReadStream(filename);
      //fs.readFile(filename, function (err, data) {
      const req = https.request(
        "https://content.dropboxapi.com/2/files/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ` + resultToken,
            "Dropbox-API-Arg": JSON.stringify({
              path: uploadPath,
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
          if (res.statusCode === 200) {
            createSharedURL(resultToken, uploadPath);
          }
          console.log("headers: ", res.headers);

          res.on("data", function (d) {
            process.stdout.write(d);
          });
        }
      );
      // req.req.socket.on("drain", function () {
      //   console.log(req.socket.bytesWritten);
      // });
      // req.on("drain", function () {
      //   var percent = req.req.socket.bytesWritten / fileSizeInBytes;
      //   events.emit("video-status", percent);
      //   console.log(
      //     "percent: " + percent + " bytes: " + req.req.socket.bytesWritten
      //   );
      // });
      // Handle any errors while reading
      readStream.on("error", (err) => {
        // handle error
        // File could not be read
        //return cb(err);
      });

      // Listen for data
      readStream.on("data", (chunk) => {
        //chunks.push(chunk);
        //console.log((bytes += chunk.length), fileSizeInBytes);
        req.write(chunk, function (error) {
          bytes += chunk.length;
          var percent = Math.round((bytes / fileSizeInBytes) * 100);
          //console.log("write callback");
          events.emit("video-status", percent);
        });
      });

      // File is done being read
      readStream.on("close", () => {
        // Create a buffer of the image from the stream
        req.end();
        //return cb(null, Buffer.concat(chunks));
      });

      // req.on("error", function (error) {
      //   //if (error) {
      //   console.log("File Upload Error: ", error);
      //   //}
      // });
      //}); // old FS
    })
    .catch((error) => {
      const { message } = error;
      if (message.includes("refresh token is invalid or revoked")) {
        console.log("please unset DROPBOX_REFRESH_TOKEN to retry");
      }
      console.log(`dropbox error: ${message}`);
    });
}
function createSharedURL(token, filePath) {
  const req = https.request(
    "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ` + token,
        "Content-Type": "application/json",
      },
    },
    (res) => {
      console.log("statusCode: ", res.statusCode);
      console.log("headers: ", res.headers);
      // console.log("URL: ", res.data);
      //   res.on("end", function () {
      //     console.log(req.data);
      //     console.log("URL",req.data.url);
      //     // your code here if you want to use the results !
      //   });

      res.on("data", function (data) {
        console.log("BODY: ", data);
        var dataObj = JSON.parse(data);
        console.log(dataObj.url);
        events.emit("share-url", dataObj.url);
      });
    }
  );

  var data = JSON.stringify({
    path: filePath,
    settings: {
      access: "viewer",
      allow_download: true,
      audience: "public",
    },
  });
  req.write(data);
  req.end();

  req.on("error", function (error) {
    //if (error) {
    console.log("Shared URL Error: ", error);
    //}
  });
}

// var i = new Interval(fncName, 1000);
// i.start();

// if (i.isRunning())

// i.stop();
