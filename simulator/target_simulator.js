const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const numTargets = 1;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public"));

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
