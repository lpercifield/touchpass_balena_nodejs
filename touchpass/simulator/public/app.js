// document.addEventListener("DOMContentLoaded", () => {
//   const socket = io();

//   const buttonsContainer = document.getElementById("buttons-container");

//   for (let i = 1; i <= 6; i++) {
//     const button = document.createElement("div");
//     button.className = "button";
//     button.innerText = i;

//     button.addEventListener("click", () => {
//       socket.emit("buttonClicked", i);
//     });

//     buttonsContainer.appendChild(button);
//   }

//   socket.on("buttonClicked", (buttonIndex) => {
//     console.log(`Button ${buttonIndex} clicked on another client`);
//   });
//   socket.on("colorChange", (newColor) => {
//     document.body.style.backgroundColor = newColor;
//   });
// });
//{"deviceId":5867696,"goal":0,"reactTime":0}

document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  const buttonsContainer = document.getElementById("buttons-container");

  let buttons = document.querySelectorAll(".button");

  const deviceArray = process.env.DEVICE_ARRAY.split(",");
  let numTargets = deviceArray.length;


  for (let i = 1; i <= (numTargets+1); i++) {
    const button = document.createElement("div");
    button.id = deviceArray[i - 1];
    button.className = "button";
    button.innerText = i;

    button.addEventListener("click", () => {
      socket.emit("buttonClicked", button.id);
    });

    buttonsContainer.appendChild(button);
  }

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      socket.emit("buttonClicked", index);
    });
  });

  socket.on("buttonClicked", (buttonId) => {
    console.log(`Button ${buttonId} clicked on another client`);
  });

  socket.on("colorChange", (data) => {
    buttons = document.querySelectorAll(".button");
    const { buttonIndex, newColor } = data;
    console.log(buttons);
    if (buttonIndex !== undefined && newColor) {
      buttons[buttonIndex].style.backgroundColor = newColor;
    }
  });
});
