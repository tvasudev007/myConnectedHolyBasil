'use strict';
var twilio = require('twilio');
var mqtt = require('mqtt')
var https = require('https');
var http = require('http');
var express = require('express')
var app = express()
var mqttClient = mqtt.connect('tcp://iot.eclipse.org:1883');

var accountSid = 'AC648d6e480e556571b1203dc06e6875ac'; // Your Account SID from www.twilio.com/console
var authToken = 'e925cbe022799c01dc9709c200a819bd';   // Your Auth Token from www.twilio.com/console
var sendSMS =[];
var low = 30;
var crtiticallyLow = 20;
var currentMoisture=0;
var twilioClient = twilio(accountSid, authToken);

mqttClient.on('connect', function () {
    console.log("subscribing to myHolyBasil/moisture topic");
    mqttClient.subscribe('myHolyBasil/moisture')
    mqttClient.publish('NodeTest', "20")
    
})



app.get('/', function (req, res) {
  res.send('Welcome to holy basil!!')
})
app.get('/calibrate/low/:lowValue', function (req, res) {
	console.log("LOW Value is : "+req.params.lowValue);
	if(!isNaN(req.params.lowValue)){
		low =req.params.lowValue;
	}
  res.send("Set low Value is : "+req.params.lowValue)
})
app.get('/low/', function (req, res) {
		
  res.send("current low Value is : "+low)
})
app.get('/critical/', function (req, res) {
		
  res.send("current critical Value is : "+crtiticallyLow)
})
app.get('/calibrate/critical/:criValue', function (req, res) {
	console.log("LOW Value is : "+req.params.criValue);
	if(!isNaN(req.params.criValue)){
		crtiticallyLow =req.params.criValue;
	}
  res.send("Set low Value is : "+req.params.criValue)
})
app.get('/moisture', function (req, res) {
	
	
  res.send("Set low Value is : "+currentMoisture)
})


mqttClient.on('message', function (topic, message) {
    // message is Buffer 
    console.log(message.toString());
    var array = message.toString().split(',');
    console.log("Moisture in % =", array[0])
	currentMoisture = array[0];
	var smsContent = 'SOS from Holy Basil: About to die..please save me :-(' + array[0] + '% ,  temperature :' + array[1] + ' Celcius, ' + 'Humidity : ' + array[2] + '%';
    if (array[0]<crtiticallyLow){
        twilioClient.messages.create({
            body: smsContent,
            to: '+918121516815',  // Text this number
            from: '+13343393143' // From a valid Twilio number
        })
            .then((message) => console.log(message.sid));
    }
    else if (array[0] < low) {
        var smsContent = 'Warning from Holy Basil : Current status moisture :' + array[0] + '% ,  temperature :' + array[1] + ' Celcius, ' + 'Humidity : ' + array[2] + '%';
        console.log(smsContent);
        twilioClient.messages.create({
            body: smsContent,
            to: '+917045698069',  // Text this number
            from: '+13343393143' // From a valid Twilio number
        })
            .then((message) => console.log(message.sid));
			twilioClient.messages.create({
            body: smsContent,
            to: '+919926395357',  // Text this number
            from: '+13343393143' // From a valid Twilio number
        })
            .then((message) => console.log(message.sid));
    }
    //mqttClient.end()
})



var server = app.listen(3000, function (){
  console.log("Calling app.listen's callback function.");
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});




