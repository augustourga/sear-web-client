const http = require('http');
const mqtt = require('mqtt');
const config = require('./config');
const hostname = '127.0.0.1';
const mqttServer = 'mqtt://m15.cloudmqtt.com';
const port = 3000;
var options = {
  port: 13049,
  host: mqttServer,
  username: 'ipwqlqlt',
  password: '62b_mnAEIeNB'
}
var client = mqtt.connect('mqtt://m15.cloudmqtt.com', options)
var topics = {
  config: 'sear/1/test',
  caca: 'sear/1/caca'
}
var initMessage = '{"action":"sear/1/test", "sM": 80, "lOn": 21, "lOff": 22, "vF": 21, "vD": 22, "vOn": 21, "vOff": 22}\n'


const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  turnOnTopics();
  listenTopics();
});

turnOnTopics = () => {
  client.on('connect', function () {
    client.subscribe(topics.config, function (err) {});
    client.subscribe(topics.caca, function (err) {})

  })
}

listenTopics = () => {
  client.on('message', function (topic, message) {
    // message is Buffer
    console.log("topic",topic.toString());
    console.log("message",message.toString());
  })
}
