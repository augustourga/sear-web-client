const mqtt = require('mqtt');
const express = require('express');
const ejs = require('ejs');

const giveMeStatus = {
  status: "giveMeStatus"
}
const app = express();
const http = require('http').Server(app);
var io = require('socket.io')(http);

var options = {
  port: 13049,
  host: 'mqtt://m15.cloudmqtt.com',
  username: 'ipwqlqlt',
  password: 'l4kzH-C8EIYg'
}
var client = mqtt.connect(options.host, options)
var topics = {
  configRequest: 'sear/config/request',
  configResponse: 'sear/config/response',
  statusRequest: 'sear/status/request',
  statusResponse: 'sear/status/response'
}

var arduStatus = {
  soilMoisture: 80,
  lightsOnTime: 0, //light time On
  lightsOffTime: 1, //light time Off
  ventilationFrequency: 1, //ventilation time On
  ventilationDuration: 2, //ventilation time off
  ventilationOnTime: 22, // ventilation frecuency
  ventilationOffTime: 22 // ventilation duration
}

app.use(express.static(__dirname + '/'));
app.set('views', __dirname + '/views');
app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');

//To read POST values
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const PORT = process.env.PORT || 3020;
io.on('connection', function (socket) {
  console.log('Client connect');
});

const operationMode = process.argv[2]
const serialPortPath = process.argv[3]
if (operationMode == "serial") {
  var SerialPort = require('serialport');
  const Readline = require('@serialport/parser-readline')
  var port = new SerialPort(serialPortPath, {
    baudRate:9600
  });

  const parser = port.pipe(new Readline({ delimiter: '\n' }))

  parser.on('data', console.log)
}


http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}/`);
  turnOnTopics();
  listenTopics();
});

turnOnTopics = () => {
  client.on('connect', function () {
    client.subscribe(topics.configRequest, (err) => err);
    client.subscribe(topics.configResponse, (err) => err),
    client.subscribe(topics.statusRequest, (err) => err)
    client.subscribe(topics.statusResponse, (err) => err)
  })
}

// io.on(topics.statusRequest, function (msg) {
//   console.log("server status request");
//   client.publish(topics.statusRequest, JSON.stringify(msg)); //MQTT Publish Ardu config
// });

listenTopics = () => {
  client.on('message', (topic, message) => {
    // message is Buffer
    try {
        var response = JSON.parse(message);
        io.emit(topic, response);
    }
    catch (e) {
      console.log("Error getting topic answer", e);
    }
  })
}
//Return JSON so index view can draw 
function parseArduStatus(status) {
  var hour = (new Date()).getHours();
  var lightOn = false;
  if (hour >= status.lightsOnTime && hour < status.lightsOffTime) {
    lightOn = true;
  }
  var ventilationOn = false;
  if (hour >= status.ventilationOnTime && hour < status.ventilationOffTime) {
    ventilationOn = true;
  }
  return {
    light: lightOn,
    ventilation: ventilationOn
  }
}



// index page 
app.get('/', function (req, res) {
  client.publish(topics.statusRequest, JSON.stringify(giveMeStatus)); //MQTT Publish Ardu config
  res.render('pages/index', parseArduStatus(arduStatus));

});

app.get('/index', function (req, res) {
  client.publish(topics.statusRequest, JSON.stringify(giveMeStatus)); //MQTT Publish Ardu config
  res.render('pages/index', parseArduStatus(arduStatus));
});

// info page 
app.get('/info', function (req, res) {
  res.render('pages/info');
});


// config page 
app.get('/config', (req, res) => {
  res.render('pages/config', topics);
});


//read POST values from views /
app.post('/config', (req, res) => {
  console.log('Entró a /config con:', req.body);
    console.log(operationMode)
    if (operationMode == "serial") {
      console.log("Comunicandose por serial...")
      port.write(JSON.stringify(req.body));
    } else {
      console.log("Sending: ", req.body);
      client.publish(topics.configRequest, JSON.stringify(req.body)); //MQTT Publish Ardu config
      console.log('Ya publiqué');
    }
});

setInterval(function(){ 
  client.publish(topics.statusRequest, JSON.stringify(giveMeStatus)); //MQTT Publish Ardu config
 }, 30000 );
