const http = require('http');
const mqtt = require('mqtt');
const express = require('express');
const config = require('./config');
const ejs = require('ejs');
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

var arduStatus = { 
  sM: 80,
  lOn: 0, //light time On
  lOff: 1, //light time Off
  vOn: 1, //ventilation time On
  vOff: 2, //ventilation time off
  vF: 22, // ventilation frecuency
  vD: 22 // ventilation duration
}

var initMessage = '{"action":"sear/1/test", "sM": 80, "lOn": 21, "lOff": 22, "vF": 21, "vD": 22, "vOn": 21, "vOff": 22}\n'



var app = express();
app.use(express.static(__dirname + '/'));
app.set('views', __dirname + '/views');
app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');

//To read POST values
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


// index page 
app.get('/', function(req, res) {
  
  res.render('pages/index', parseArduStatus(arduStatus) );

});

app.get('/index', function(req, res) {
	res.render('pages/index');
});

// info page 
app.get('/info', function(req, res) {
	res.render('pages/info');
});


// config page 
app.get('/config', function(req, res) {
  res.render('pages/config');
});

//read POST values from views /
app.post('/', function(req, res){


  if(req.body.topic ='sear/config/request')
  {
    //console.log("Sending: ",req.body); 
    client.publish(req.body.topic,req.body.toString()) //MQTT Publish Ardu config
    arduStatus = req.body;
    console.log(arduStatus);
    res.redirect('/') //modificar view de status
  }

  

  

});

app.listen(port, hostname, () => {
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
    
    try
    {
      var response = JSON.parse(message.toString());
      console.log("Receivine message from :", topic.toString() ); //Topic Name
    }
    catch(e)
    {
      Console.log("Error getting topic answer",response);
    }
    


  })
}

//Return JSON so index view can draw 
function parseArduStatus(status){

    
  var hour = (new Date()).getHours();
  
  var lightOn = false;    
  if( hour >= status.lOn && hour < status.lOff){
    lightOn = true;
  }

  var ventilationOn = false; 
  if( hour >= status.vOn && hour < status.vOff){
    
    ventilationOn = true;
  }

    return { 
      light : lightOn , 
      ventilation : ventilationOn
    }
}
