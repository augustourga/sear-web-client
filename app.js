const http = require('http');
const mqtt = require('mqtt');
const config =require('./config');
const hostname = '127.0.0.1';
const mqttServer = 'mqtt://m15.cloudmqtt.com';
const port = 3000;
var options = {
  port:13049,
  host: mqttServer,
  username: 'ipwqlqlt',
  password: '62b_mnAEIeNB'
}
var client  = mqtt.connect('mqtt://m15.cloudmqtt.com',options)
var topics = {
  config : 'sear/1/config'
}
var initMessage = '{"action":"sear/1/config", "a": 80, "b": 21, "c": 22, "d": 30, "e": 15, "f": 21, "g": 22}'


client.on('connect', function () {
  client.subscribe(topics.config, function (err) {
    if (!err) {
      client.publish(topics.config,initMessage)
    }else {
    }
  })
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  client.end()
})

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
