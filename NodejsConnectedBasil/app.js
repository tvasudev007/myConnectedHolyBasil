'use strict';
var twilio = require('twilio');
var mqtt = require('mqtt')
var mqttClient = mqtt.connect('tcp://iot.eclipse.org:1883');

var accountSid = 'AC648d6e480e556571b1203dc06e6875ac'; // Your Account SID from www.twilio.com/console
var authToken = 'e925cbe022799c01dc9709c200a819bd';   // Your Auth Token from www.twilio.com/console
var sendSMS =[];

var twilioClient = twilio(accountSid, authToken);

mqttClient.on('connect', function () {
    console.log("subscribing to myHolyBasil/moisture topic");
    mqttClient.subscribe('myHolyBasil/moisture')
    mqttClient.publish('NodeTest', "20")
    
})

mqttClient.on('message', function (topic, message) {
    // message is Buffer 
    console.log(message.toString());
    var array = message.toString().split(',');
    console.log("Moisture in % =", array[0])
    if (array[0]<7){
        twilioClient.messages.create({
            body: 'SOS from Holy Basil: About to die..please save me :-(' + array[0] + '% ',
            to: '+918121516815',  // Text this number
            from: '+13343393143' // From a valid Twilio number
        })
            .then((message) => console.log(message.sid));
    }
    else if (array[0] < 8) {
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



