# Nitrogen Labs for the Arduino Yun with Johnny-Five

This is a quick stater for doing a Nitrogen app on an Arduino Yun. It's going to use Johnny-Five which allows you to run node.js on your host machine, windows, osx, linux, ..., to control your Arduino. In this case we're going to run the app on the Yun's OpenWRT side and let it control the arduino side. You can get started running all of the samples on your laptop and then deploy over to the Yun. 

## Running the sample:

1. Clone or fork this repo: `https://github.com/joshholmes/n2labs.git`
2. Fetch and install its node.js dependencies: `npm install`
3. Edit config section to change defaults as necessary. You'll definitely need to set the API_KEY as detailed below.
4. `npm start`

## Prerequisites 

You will need: 

1. [Arduino Yun](http://arduino.cc/en/Main/ArduinoBoardYun?from=Products.ArduinoYUN). 
2. And you'll need to prep your Arudino Yun. If you are in one of my labs, I've already done this for you. Otherwise, check the bottom of this page for details. 
[Running Johnny-Five](./runningjohnnyfive.md)
3. Then you'll need to go through their [starting guide](http://start.tessel.io/install). 

The next bit that you'll need is on the Nitrogen side. 

1. You'll need to create an account. 
2. You'll need to install the Nitrogen client library for your laptop so you can prevision devices and send command. See the [Nitrogen starting guide](http://nitrogen.io/guides/start/setup.html) for more details. 


## Getting your API Key

The next thing that you need to do is get your API key from Nitrogen. 

Two ways to get this. The first is to log into the [Nitrogen admin portal](https://admin.nitrogen.io) and look at the API Keys tab. 

The second is to use the `> n2 apikeys ls` command to find your api key then run the following command.

Edit the config section to include this. 


``` javascript
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
    api_key: "<YOUR API KEY>"
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

```

## Windows specific instructions

If you are on Windows you'll also need to edit the johnny-five-board-init.js to update the port number to the correct port number. I usually fire up the Arduino IDE and let it tell me which port the Yun is on. 

## Running the project

Then run the following command:

'node blinkyn2.js'

To send a command to your device, use the n2 command line as follows:

`> n2 message send '{"type": "_custom", "tags":["command:<device id>"], "body": {"send": "humidity"}, "from":"<principal id>", "to":"<device id>"}'`

Log into the [Web Admin Message center](https://admin.nitrogen.io/#/messages/skip/0/sort/ts/direction/-1) to see your messages. 

## Prepping the Yun for Johnny-Five and Nitrogen

1. Bring up, configure for network: http://arduino.cc/en/Guide/ArduinoYun (Configuring the Onboard WiFi)
2. Upgrade to latest linino: http://linino.org/doku.php?id=wiki:upgradeimage
3. Expand onto SD: http://arduino.cc/en/Tutorial/ExpandingYunDiskSpace
  a. Use 4096 for the expansion 
4. Add Swap: http://www.cambus.net/getting-started-with-openwrt/
  a. dd if=/dev/zero of=/swapfile count=512 bs=1M
  b. mkswap /swapfile
  c. swapon /swapfile
  d. Edit /etc/config/fstab, thusly:
config swap
  option device    /swapfile
  e. /etc/init.d/fstab enable
5. opkg update
6. opkg install binutils
7. wget  http://downloads.arduino.cc/openwrtyun/1/packages/yun-gcc_4.6.2-2_ar71xx.ipk
8.  opkg install --force-overwrite yun-gcc_4.6.2-2_ar71xx.ipk
9. opkg update
  # vi sometimes generates xterm errors
  a. opkg install vim
10. Install Node: http://blog.arduino.cc/2014/05/06/time-to-expand-your-yun-disk-space-and-install-node-js/
  a. opkg install node
11. Serialport/johnny-five/firmata update (2nd half of): http://linino.org/doku.php?id=wiki:nodejs
  a. opkg install node-serialport
  b. npm install –g johnny-five

  c. sed -i -e 's/ttyATH0/# ttyATH0/g' /etc/inittab

12. npm install –g nitrogen
13. npm install –g nitrogen-cli
14. opkg install alljoyn-samples alljoyn-sample_apps