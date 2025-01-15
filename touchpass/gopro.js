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

  module.exports = {enableUSB,setResolution,setFramerate,startRecording,stopRecording,getLastCaptureName,uploadFile,downloadFile };