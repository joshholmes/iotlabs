var five = require("johnny-five");
var board = new five.Board();

var LEDPIN = 13; //13 is an LED on the board as well as a pin

board.on("ready", function(){
	console.log("Board connected...");

	this.pinMode(LEDPIN, five.Pin.OUTPUT);
	var led = new five.Pin(LEDPIN);

	led.write(1);
});