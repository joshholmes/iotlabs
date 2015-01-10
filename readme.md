# Nitrogen Labs for the Arduino with Johnny-Five

This is a quick stater for doing a Nitrogen app on an Arduino. It's going to use Johnny-Five which allows you to run node.js on your host machine, windows, osx, linux, ..., to control your Arduino. 

All of these labs should work with the Arduino Uno, Arduino Due and the Arduino Yun. I've not tested them with other Arduinos but there's no reason they shouldn't. 

At the end of these labs, if you have a Yun you can run the app on the Yun's OpenWRT side and let it control the Arduino side. 

## Prerequisites 

You will need: 

1. [Arduino Yun](http://arduino.cc/en/Main/ArduinoBoardYun?from=Products.ArduinoYUN). 
2. And you'll need to prep your Arduino Yun. If you are in one of my labs, I've already done this for you. Otherwise, check the bottom of this page for details. 
4. Flash the Arduino with Johnny-Five - directions at [Running Johnny-Five](./runningjohnnyfive.md)
3. Then you'll need to go through their [starting guide](http://start.tessel.io/install). 

## The next bit that you'll need is on the Nitrogen side. 

1. You'll need to install the Nitrogen client library for your laptop so you can prevision devices and send command. See the [Nitrogen starting guide](http://nitrogen.io/guides/start/setup.html) for more details. 

At this point you've set up Johnny-Five, flashed your Arduino, run your first Johnny-Five app and finally installed the Nitrogen client bits. 

## Connecting to Nitrogen:

The next thing to do is to connect to Nitrogen and start sending in telemetry data. 

1. Create a file called `blinkn2.js`. N2 is our shorthand for Nitrogen. 
2. Type in your requires

        ```
        var nitrogen = require('nitrogen');
        var five = require("johnny-five");
        ```

3. Now let's fill out your board initialization
Please refer to the [Running Johnny-Five](./runningjohnnyfive.md) to make sure you are connecting properly for your platform.  

        ```
        var board = new five.Board();

        var led;

        var LEDPIN = 13;
        var OUTPUT = 1;

        board.on("ready", function(){
          console.log("Board connected...")

          // Set pin 13 to OUTPUT mode
          this.pinMode(LEDPIN, OUTPUT);
        });
        ```

At this point we've initialized your board and are ready to connect to Nitrogen. 

4. Now let's get our Nitrogen configuration ready. 
In a real app, you should put this in a config file somewhere. 

For the API Key Below, if you are in my lab, use the following API key
`0dec2ee8e45d4bc660a749feb8f2e978`

Otherwise, you need to get an API key from the Nitrogen service following the directions at [getting your API key](./gettingyourapikey). 

Also, make sure that the host and port are correct for your environment. The sample here is using the publicly hosted instance of Nitrogen. 

        ```
        var config = {
            host: process.env.HOST_NAME || 'api.nitrogen.io',
            http_port: process.env.PORT || 443,
            protocol: process.env.PROTOCOL || 'https',
            api_key: "<Your API key>"
        };

        var Store = require('nitrogen-file-store');
        config.store = new Store(config);
        ```

5. Now we're ready to set up your device. 

The first part is to initialize your device as follows. Be sure to change your name to something more unique to you than My Nitrogen Device. 

        ```
        var simpleLED = new nitrogen.Device({
            nickname: 'simpleLED',
            name: 'My Nitrogen Device',
            tags: ['sends:_isOn', 'executes:_lightOn'],
            api_key: config.api_key
        });
        ```

6. The next thing is to connect to the service and send a message. 

        ```
        var service = new nitrogen.Service(config);
        service.connect(simpleLED, function(err, session, simpleLED) {
            console.log("Connected to Nitrogen");
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
        ```

At this point you can actually run the app by using the command 'node blinkn2.js'. What it will do is connect to Nitrogen and use your API key to get a device provisioned, save your new device identity into a file called (by default) api.nitrogen.io_443. Then it will send a message to the portal with this new identity. 

Log into the [Admin Portal](https://admin.nitrogen) and look at the messages tab to see your messages. 

## Receiving commands. 

Now that we have your device able to send telemetry data, let's set it up to receive commands. This is a little more involved but not terribly hard. 

7. The way that we're going to do this is to create a "command manager". 

        ```
        function simpleManager() {
            nitrogen.CommandManager.apply(this, arguments);
        }

        simpleManager.prototype = Object.create(nitrogen.CommandManager.prototype);
        simpleManager.prototype.constructor = simpleManager;
        ```

At this point we've got a command manager object and we've set it's prototype to the generic nitrogen.CommandManager prototype so technically it could receive commands but by default it doesn't tell Nitrogen that it's interested in any messages. 

8. The next thing is to tell Nitrogen which messages your device is interested in. 

The isCommand function tells Nitrogen that this is a command that you respond to and the isRelevant are messages that you want to see. 

        ```
        simpleManager.prototype.isCommand = function(message) {
            return message.is('_lightOn');
        };

        simpleManager.prototype.isRelevant = function(message) {
            var relevant = ( (message.is('_lightOn') || message.is('_isOn')) &&
                             (!this.device || message.from === this.device.id || message.to == this.device.id));

            return relevant;
        };
        ```

9. The next thing is to tell Nitrogen which messages you've already handled. 

If you don't set this properly, you'll either kill messages before you've seen them or you'll always see messages that you've been sent for ever or at least until they time out. 

First let the base manager try to handle it and second, try to handle it yourself. You get the two messages, the downstream and the upstream so you can check to see if it was a request response or whatever. 

        ```
        simpleManager.prototype.obsoletes = function(downstreamMsg, upstreamMsg) {
            if (nitrogen.CommandManager.obsoletes(downstreamMsg, upstreamMsg))
                return true;

            var value = downstreamMsg.is("_isOn") &&
                        downstreamMsg.isResponseTo(upstreamMsg) &&
                        upstreamMsg.is("_lightOn");

            return value;
        };
        ```

10. The next bit is to actually receive the message and process it. 

This is a longer function because it's all of your actual business logic. 

        ```
        simpleManager.prototype.executeQueue = function(callback) {
            var self = this;

            if (!this.device) return callback(new Error('no device attached to control manager.'));

            // This looks at the list of active commands and returns if there's no commands to process.
            var activeCommands = this.activeCommands();
            if (activeCommands.length === 0) {
                this.session.log.warn('simpleManager::executeQueue: no active commands to execute.');
                return callback();
            }

            var lightOn;
            var commandIds = [];

            // Here we are going to find the final state and but collect all the 
            // active command ids because we'll use them in a moment.
            activeCommands.forEach(function(activeCommand) {
              console.log("activeCommand: " + JSON.stringify(activeCommand));
                try {
                  lightOn = activeCommand.body.value;
                  commandIds.push(activeCommand.id);

                  if (lightOn == "true")
                  {
                    board.digitalWrite(LEDPIN, 1);
                  }
                  else
                  {
                    board.digitalWrite(LEDPIN, 0);
                  }

                 } catch (ex) {
                  callback(ex);
                }
            });

            // This is the response to the _lightOn command.
            var message = new nitrogen.Message({
                type: '_isOn',
                tags: nitrogen.CommandManager.commandTag(self.device.id),
                body: {
                    command: {
                        message: "Light (" + simpleLED.id + ") is " + JSON.stringify(lightOn) + " at " + Date.now()
                    }
                },
                // Notice the response_to is the array of command ids from above. 
                // This is used in the obsoletes method above as well.
                response_to: commandIds
            });

            message.send(this.session, function(err, message) {
                if (err) return callback(err);

                // let the command manager know we processed this _lightOn message by passing it the _isOn message.
                self.process(new nitrogen.Message(message));

                // need to callback if there aren't any issues so commandManager can proceed.
                return callback();
            });
        }
        ```

11. Now we need to kick off the Command Manager as follows

The filter below is an array of tags of on the messages that you're interested in. 

        ```
        simpleManager.prototype.start = function(session, callback) {
            var filter = {
                tags: nitrogen.CommandManager.commandTag(this.device.id)
            };

            return nitrogen.CommandManager.prototype.start.call(this, session, filter, callback);
        };
        ```

12. The very last bit of code is to initialize the command manager in the session start. 

We already have a session start so modify that function as follows

        ```
        service.connect(simpleLED, function(err, session, simpleLED) {
        ... all of the existing code stays, just add the following

            new simpleManager(simpleLED).start(session, function(err, message) {
                if (err) return session.log.error(JSON.stringify(err));
            });
        });

        ```

At this point, run your device with the command `node blinkn2.js`. 

Once it's up and running, you are ready to send commands to the device from a different laptop or just a different terminal window. Make sure to keep the johnny-five app running. 

13. Send commands as follows. 

Step one, get your device ID by either logging into the portal and looking for your device in the list of devices or you can run the command `n2 device ls`.

The one catch here is that different operating systems parse command line JSON in different ways so look for your OS's 

Windows 8
```
n2 message send '{\"type\": \"_lightOn\", \"tags\":[\"command:<Your Device ID>\"], \"body\": {\"value\": \"true\"}, \"to\":\"<Your Device ID>\"}'
```

Windows 7 or prior
```
n2 message send "{\"type\": \"_lightOn\", \"tags\":[\"command:<Your Device ID>\"], \"body\": {\"value\": \"true\"}, \"to\":\"<Your Device ID>\"}"
```

Mac or Linux
```
n2 message send '{"type": "_lightOn", "tags":["command:<Your Device ID>"], "body": {"value": "true"}, "to":"<Your Device ID>"}'
```

At this point you have gotten your board prepped for Johnny-Five, a Johnny-Five app, connected to Nitrogen and received messages from Nitrogen. 

Congratulations! 

The last step is only if you have a Yun. 

If you got the Yun from me, it's probably already set up. If you didn't you'll need to install Node and Johnny Five on the Yun by following the directions at [Prepping your Yun for Johnny-Five](preppingyunforjohnnyfiveandnitrogen.md). 

Once your Yun is set up, you can deploy the node app to your Yun and run it from there. That way you can disconnect your laptop, power the Yun from a wall plug or battery pack and let it run the program itself. 