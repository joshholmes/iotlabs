var five = require("johnny-five");

var board = new five.Board(); // Remember to look at [Running johnny-five](../../runningjohnnyfive.md) to connect your board on your OS

var SERVO_PIN = 9;

board.on("ready", function(){
	console.log("Board connected...")

	var servo = new five.Servo(SERVO_PIN);
	servo.sweep();
});