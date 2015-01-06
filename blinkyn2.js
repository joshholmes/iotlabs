var nitrogen = require('nitrogen');

var five = require("johnny-five");
var fiveinit = require("./johnny-five-board-init");
var board = fiveinit.getBoard();

var Store = require('nitrogen-file-store');

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

config.store = new Store(config);

var simpleLED = new nitrogen.Device({
    nickname: 'simpleLED',
    name: 'My Nitrogen Device',
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
