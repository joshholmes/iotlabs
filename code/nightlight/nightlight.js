var five = require("johnny-five");

var board = new five.Board();

var LEDPIN = 13;

board.on("ready", function(){
	console.log("Board connected...");

	this.pinMode(LEDPIN, five.Pin.OUTPUT);
	var led = new five.Pin(LEDPIN);

	var light = new five.Sensor("A0");

	light.on("change", function() {
		var lightValue = Math.round(this.value * .1);

		console.log(lightValue);

		led.write(lightValue > 20 ? 0: 1);
	});      
});
