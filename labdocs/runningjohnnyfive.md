# Getting Johnny-Five up and running on your Arduino

Johnny-Five is a [node.js](http://nodejs.org) application that can control your Arduino from a host computer. The great news is that most platforms these days run node.js. This includes Windows, Mac, Linux and even a lot of the embedded OS platforms such as OpenWRT which runs on the Arduino Yun. 

## Prepping your Arduino

The first thing that you need to do is flash your Arduino with the firmware required to allow a host device to control it. This is very simple and boiler plate. 

0. Install the Arduino IDE. You can download it from [Arduino.cc](http://arduino.cc/downloads)
	a. If you are using the Arduino Yun or the Arduino Due, make sure that you download a copy that has support for it. Currently that's the 1.5.8 Beta.
1. Plug your Arduino into your laptop
2. Open the Arduino IDE. 
3. Click on File | Examples | Firmata | StandardFirmata (this will open a new sketch - close the original sketch and proceed using the new sketch).
4. Click on Tools | Board | &lt;Your board type&gt;
5. Click on Tools | Port | &lt;Your Arduino's Port&gt;
6. Upload the sketch to your Arduino

At this point your device is ready to go. Close the Arduino IDE (we're not going to be using it to code your application logic). 

## Prepping your desktop

1. Install node.js. You can download that from the [official node.js site](http://nodejs.org).
2. Open a terminal/command line with node.js support. 
3. Install johnny-five as follows 
	a. `npm install johnny-five`
4. Create a file called `blink.js`
5. Type the following

```
var five = require ("johnny-five");
var board = new five.Board();
```

This will create an object that talks to your board. On OSX, that's all you have to do. For Windows, you'll need to set the COM port for your board and for Linux, there's a little extra that you'll need to do. 

Windows:
```
var board = new five.Board({
	port: "COM4" // Make sure that this is your COM Port from Step 6 above
	}); 
```
Linux:
```
var serialport = require("serialport");
var serialPort = new serialport.SerialPort("/dev/ttyATH0", { // Make sure this is correct for your laptop
		baudrate: 57600
	});
var board = new five.Board({
		port: serialPort,
		debug: true
	});
```

Now we're ready to interact with the board. 

```
var LEDPIN = 13;
var OUTPUT = 1;
 
board.on("ready", function(){
  var val = 0;
 
  // Set pin 13 to OUTPUT mode
  this.pinMode(LEDPIN, OUTPUT);
 
  // Create a loop to "flash/blink/strobe" an led
  this.loop( 100, function() {
    this.digitalWrite(LEDPIN, (val = val ? 0 : 1));
  });
});
```

There are a couple methods that you could use to flash the LED but this one gives you more flexibility as it will let you do different things if you can just write to the pins directly. The simplest one is like this: 

```
  led = new five.Led(13);
  led.strobe(100); // 100 milliseconds
```

But we're not going to use that. 

## Running your first Johnny-Five project. 

Now that we have the node app running, double check that your Arduino is plugged in. 

1. At the command prompt, run the app as follows

'node blink.js'

You should see the light on your board start blinking every 100 milliseconds. 

## Summary

At this point you've got Johnny-Five set up, your Arduino flashed with the StandardFirmata and you're ready to start playing further. 
