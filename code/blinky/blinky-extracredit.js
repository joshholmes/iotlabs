var five = require("johnny-five");
var board = new five.Board();

var LEDPIN = 13; //13 is an LED on the board as well as a pin

board.on("ready", function(){
  console.log("Board connected...");

  this.pinMode(LEDPIN, five.Pin.OUTPUT);
  var led = new five.Pin(LEDPIN);

  var pinOn = false;
  	setInterval(function() {
        if (pinOn)
        {
			console.log("Pin off");
			led.write(0);
        }
        else
        {
			console.log("Pin on");
			led.write(1);
        }
        pinOn = !pinOn;
    }, 1000);
});