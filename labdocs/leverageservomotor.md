# Leveraging the servo motor with Johnny-Five

One of the things that you might want to do is use a Servo motor. This is not hard with Johnny Five. 

## Wiring up the servo

The first thing that you need to do is wire up the Servo motor. This is the "stepper motor", not the rotary motor. 

1. Connect the red wire to the 5v power. 
2. Connect the black wire to the ground. 
3. Connect the yellow wire to Pin 9. Really this could be any pin but I'm using 9 in the lab below so make sure that you match that up. 


## Coding your servo

The next thing to do is write the node.js app that controls it. 

```
var five = require("johnny-five");

var board = new five.Board(); // Remember to look at [Running johnny-five](../../runningjohnnyfive.md) to connect your board on your OS

var SERVO_PIN = 9;

board.on("ready", function(){
	console.log("Board connected...")

	var servo = new five.Servo(SERVO_PIN);
	servo.sweep();
});
```

The sweep call will move the servo through it's full range of motion and back. 

Try the following functions:
	- servo.min() // moves to the min
	- servo.max() // moves to the max
	- servo.to(n) // moves to whatever degree you pass in as a number as long as it's in range
	- servo.step(n) // moves n number of degrees from where the servo is now. This can be a negative number

There are also a lot of ways to initialize the servo but check out [Johnny-Five Servo docs](https://github.com/rwaldron/johnny-five/blob/master/docs/servo.md) for more information  . 

## Extra credit

Now that you've got your servo running, the next thing you should wire it in with your Nitrogen device code and turn your motor from afar... :) 

Good luck! 