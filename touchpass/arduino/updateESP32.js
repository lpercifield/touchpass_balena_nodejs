const spawn = require("child_process").spawn;

const doUpdate = (ipAddress, file, callback) => {
  //python3 "espota.py" -r -i 10.42.0.244 -p 3232 --auth=4TouchPass -f "touch_pass.ino.bin"
    const pythonProcess = spawn("python3", [
      './arduino/espota.py',
      '-r',
      '-i',
      ipAddress,
      '-p',
      '3232',
      '--auth=4TouchPass',
      '-f',
      file
    ]);
  //const pythonProcess = spawn("python3 espota.py -r -i 10.42.0.244 -p 3232 --auth=4TouchPass -f 'touch_pass.ino.bin'");
  pythonProcess.stdout.on("data", (data) => {
    console.log("---DATA--");
    console.log(ipAddress, "stdout: ", data);
    console.log("---DATA--");
    // Do something with the data returned from python script
  });
  pythonProcess.stderr.on("data", (data) => {
    //console.log(ipAddress,`stderr: ${data}`);
    console.log(ipAddress);
    console.log(data.toString());
  });
  pythonProcess.on("error", function (error) {
    console.log(ipAddress,"error code:", error);
    //return callback();
  });
    pythonProcess.on("close", function (error) {
      console.log(ipAddress,"close code:", error);
      return callback();
    });
  pythonProcess.on("exit", function (code, sig) {
    console.log(ipAddress,"exit code:", code, " sig:", sig);
    //return callback();
  });
};
exports.doUpdate = doUpdate;
