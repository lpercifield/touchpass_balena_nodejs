const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const dgram = require("dgram");
const udpSocket = dgram.createSocket("udp4");

const numTargets = 1;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const ipRange = process.env.BROADCAST_ADDRESS;

app.use(express.static("public"));
require('dotenv').config();

// Function to generate a random color
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < numTargets; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Emit color change event to all clients
const emitRandomColorToButton = () => {
  const randomColor = getRandomColor();
  const randomButtonIndex = Math.floor(Math.random() * 6); // Assuming you have 6 buttons

  io.emit("colorChange", {
    buttonIndex: randomButtonIndex,
    newColor: randomColor,
  });
};
const emitRandomColor = () => {
  const randomColor = getRandomColor();
  io.emit("colorChange", randomColor);
};
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("buttonClicked", (buttonIndex) => {
    console.log(`Button ${buttonIndex} clicked`);
    emitRandomColor();
    //sendUDP(buttonIndex);

  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Schedule random color changes every 10 seconds
setInterval(() => {
  emitRandomColorToButton();
}, 10000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
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
    console.log("Sending: " + responseJson + "to port - " + port);
    //const response = "Hellow there!";
    udpSocket.setBroadcast(true);
    udpSocket.send(responseJson, 0, responseJson.length, port, ipRange);
  } catch (e) {
    console.log(e);
    // expected output: SyntaxError: Unexpected token o in JSON at position 1
  }
}
function sendAck(retry) {
  var doc;
  // Add values in the document
  doc["deviceId"] = chipId;
  doc["ack"] = 1;
  // if (isActive) {
  //   doc["goal"] = 1;
  //   doc["reactTime"] = lastReactTime;
  //   isActive = false;
  // } else {
  //   doc["goal"] = 0;
  //   doc["reactTime"] = 0;
  // }
  if(retry){
    doc["retry"] = 1;
  }

  // String outputJson;

  // serializeJson(doc, outputJson);
  // udp.broadcastTo(outputJson.c_str(), 4321);
  // //messageSentTime = millis();
  // //messageSent = true;
  // writeTFTStatus("Ack Sent");
  udpSocket.setBroadcast(true);
  udpSocket.send(doc, 0, doc.length, "4321");
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
    console.log("received: ",receivedJson);
    // expected output: 42
    // console.log(receivedJson.result);
    // expected output: true
   
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

udpSocket.bind("4432");
udpSocket.on("listening", function () {
  console.log("Listeneing");
});