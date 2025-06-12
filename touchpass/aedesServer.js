const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const port = 1883

var app = require("./app");
var events = app.get("event");

server.listen(port, function () {
  console.log('server started and listening on port ', port)
})
aedes.on('clientError', function (client, err) {
  console.log('client error', client.id, err.message, err.stack)
})

aedes.on('connectionError', function (client, err) {
  console.log('client error', client, err.message, err.stack)
})

aedes.on('publish', function (packet, client) {
  if (packet.topic === "quikick/goal") {
    console.log('message from client', client.id, packet.topic, JSON.parse(packet.payload.toString()))
    events.emit("target-goal", packet.topic, packet.payload);
  }
})

aedes.on('subscribe', function (subscriptions, client) {
  if (client) {
    console.log('subscribe from client', subscriptions, client.id)
  }
})

aedes.on('client', function (client) {
  console.log('new client', client.id)
})