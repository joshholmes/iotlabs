var os = require('os');

var nitrogen = require('nitrogen');

var five = require("johnny-five");
var board =  getBoard();

function getBoard() {
  var OS = os.platform();

  console.log("OS: " + os.platform());

  if (OS == "windows") {
    return new five.Board(
      { port: "COM4"}); // Make sure that this is your COM Port
  }
  if (OS == "darwin") { // This is OSX
    return new five.Board();
  }
  if (OS == "linux")
  {
    return getBoardOnYun();
  }
}

function getBoardOnYun()
{
  var serialport = require("serialport");

        var serialPort = new serialport.SerialPort("/dev/ttyATH0", {
           baudrate: 57600
   });
      return new five.Board({
              port: serialPort,
              debug: true
    });
}

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


var config = {
    host: process.env.HOST_NAME || 'api.nitrogen.io',
    http_port: process.env.PORT || 443,
    protocol: process.env.PROTOCOL || 'https',
    api_key: "75fecc9fef5fb9ba488e987216442595"
};

var led;


//  config.store = new Store(config);

var simpleLED = new nitrogen.Device({
    nickname: 'simpleLED',
    name: 'My LED',
    tags: ['sends:_isOn', 'executes:_lightOn'],
    api_key: config.api_key
});

var service = new nitrogen.Service(config);

service.connect(simpleLED, function(err, session, simpleLED) {
    if (err) return console.log('failed to connect simpleLED: ' + err);

    var message = new nitrogen.Message({
        type: '_isOn',
        body: {
            command: {
                message: "Light (" + simpleLED.id + ") is On at " + Date.now()
            }
        }
    });

    message.send(session);
});

   
  board.on("ready", function() {
 
    // Create a standard `led` hardware instance
    led = new five.Led(13);
 
    // "strobe" the led in 100ms on-off phases
    led.strobe(100);
  })
