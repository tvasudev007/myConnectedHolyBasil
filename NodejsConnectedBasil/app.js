'use strict';
var twilio = require('twilio');
var mqtt = require('mqtt')
var https = require('https');
var http = require('http');
var express = require('express');
var cron = require('node-cron');
var app = express()
var mqttClient = mqtt.connect('tcp://iot.eclipse.org:1883');
var nodemailer = require('nodemailer');
var owner="tvasudev17@gmail.com";
var guest="pratikbansal15@gmail.com";

var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {  user: "myconnectedthings007@gmail.com",  pass: "tvasudev007"    },
	tls: { rejectUnauthorized: false }
});



var emailSend = function(address,subject,message){
var mailOptions = {   to : address, subject : subject,  text : message}
	
	smtpTransport.sendMail(mailOptions, function(error, response)
{
	if(error)
	{
	console.log(error);

	}
	else{
	console.log("Message sent: " + response.message);

	}
});
}

var accountSid = 'AC648d6e480e556571b1203dc06e6875ac'; // Your Account SID from www.twilio.com/console
var authToken = 'e925cbe022799c01dc9709c200a819bd';   // Your Auth Token from www.twilio.com/console
var sendSMS =[];
var low = 30;
var crtiticallyLow = 20;
var moisture =0;
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
app.get('/mositure/', function (req, res) {
		
  res.send("current mositure Value is : "+moisture);
})


mqttClient.on('message', function (topic, message) {
    // message is Buffer 
    console.log(message.toString());
    var array = message.toString().split(',');
    console.log("Moisture in % =", array[0])
	moisture = array[0];
	var smsContent = 'SOS from Holy Basil: About to die..please save me :-(' + array[0] + '% ,  temperature :' + array[1] + ' Celcius, ' + 'Humidity : ' + array[2] + '%';
    if (array[0]<crtiticallyLow){
		emailSend(owner,"Crtical Warning",smsContent);
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
		emailSend(guest,"Warning",smsContent);
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


cron.schedule('0 */6 * * *', function(){
	emailSend(guest,"Status",moisture+" % ");
	emailSend(owner,"Status",moisture+" % ");
	emailSend("anuja.bhor@lntinfotech.com","Status from Holy Basil",moisture+" % ");
	emailSend("vasudev.tadavarthy@lntinfotech.com","Status from Holy Basil",moisture+" % ");
	emailSend("prateek.bansal@lntinfotech.com","Status from Holy Basil",moisture+" % ");
	emailSend("akshay.narwadkar@lntinfotech.com","Status from Holy Basil",moisture+" % ");
	emailSend("akash.vishnoi@lntinfotech.com","Status from Holy Basil",moisture+" % ");
	

	console.log('running a task every 6 hrs '+moisture+" % ");
});
	/* emailSend("anuja.bhor@lntinfotech.com","Status from Holy Basil",moisture+" % ");
	emailSend("vasudev.tadavarthy@lntinfotech.com","Status from Holy Basil",moisture+" % ");
	emailSend("prateek.bansal@lntinfotech.com","Status from Holy Basil",moisture+" % ");
	emailSend("akshay.narwadkar@lntinfotech.com","Status from Holy Basil",moisture+" % ");
	emailSend("akash.vishnoi@lntinfotech.com","Status from Holy Basil",moisture+" % ");
	emailSend("vasudev.tadavarthy@lntinfotech.com","Status",moisture+" % "); */

var server = app.listen(3000, function (){
  console.log("Calling app.listen's callback function.");
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});




