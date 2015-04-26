# Receiving commands from Nitrogen

In the previous lab ([connecting to Nitrogen](./connect.md)) you connected to Nitrogen and were able to send in telemetry data. In this lab, we'll connect up the second side of equation and be able to turn on and off the light remotely. 

## Receiving commands. 

Now that we have your device able to send telemetry data, let's set it up to receive commands. This is a little more involved but not terribly hard. 

We're going to start with the same basic telemetry data device that you completed in the previous lab called Connect. 

## Adding the LED bits to the app. 
1. Add the LED bits to the top of the little device app. 

```
// these first two were already there
var five = require("johnny-five");
var board = new five.Board();

// add these two
var LEDPIN = 13;
var led = null;
...
```

2. In the board connect, add the LED output device 

```
    board.on("ready", function(){
        console.log("Board connected...");

        var light = new five.Sensor("A0");
        
        // add these two lines here: 
        this.pinMode(LEDPIN, five.Pin.OUTPUT);
        led = new five.Pin(LEDPIN);
        ... 
```

## Creating a command manager for Nitrogen.

A command manager receives and handles commands from the server side. 

1. The way that we're going to do this is to create a "command manager". 

        ```
        function SimpleCommandManager() {
            nitrogen.CommandManager.apply(this, arguments);
        }

        SimpleCommandManager.prototype = Object.create(nitrogen.CommandManager.prototype);
        SimpleCommandManager.prototype.constructor = SimpleCommandManager;
        ```
    
    At this point we've got a command manager object and we've set it's prototype to the generic nitrogen.CommandManager prototype so technically it could receive commands but by default it doesn't tell Nitrogen that it's interested in any messages. 

2. The next thing is to tell Nitrogen which messages your device is interested in. 

    The isCommand function tells Nitrogen that this is a command that you respond to and the isRelevant are messages that you want to see. 

        ```
        SimpleCommandManager.prototype.isRelevant = function(message) {
            console.log("isRelevant");

            var relevant = ( (message.is('_lightOn') || message.is('_lightLevel')) &&
                             (!this.device || message.from === this.device.id || message.to == this.device.id));

            return relevant;
        };

        SimpleCommandManager.prototype.isCommand = function(message) {
            console.log("isCommand");
            return message.is('_lightLevel');
        };
        ```

9. The next thing is to tell Nitrogen which messages you've already handled. 

    If you don't set this properly, you'll either kill messages before you've seen them or you'll always see messages that you've been sent for ever or at least until they time out. 
    
    First let the base manager try to handle it and second, try to handle it yourself. You get the two messages, the downstream and the upstream so you can check to see if it was a request response or whatever. 

        ```
        SimpleCommandManager.prototype.obsoletes = function(downstreamMsg, upstreamMsg) {
            console.log("obsoletes");

            if (nitrogen.CommandManager.obsoletes(downstreamMsg, upstreamMsg))
                return true;

            var value = downstreamMsg.is("_lightOn") &&
                        downstreamMsg.isResponseTo(upstreamMsg) &&
                        upstreamMsg.is("_lightLevel");

            return value;
        };
        ```

10. The next bit is to actually receive the message and process it. 

    This is a longer function because it's all of your actual business logic. 

        ```
        SimpleCommandManager.prototype.executeQueue = function(callback) {
            console.log("executeQueue");

            var self = this;

            if (!this.device) return callback(new Error('no device attached to control manager.'));

            // This looks at the list of active commands and returns if there's no commands to process.
            var activeCommands = this.activeCommands();
            if (activeCommands.length === 0) {
                this.session.log.warn('SimpleCommandManager::executeQueue: no active commands to execute.');
                return callback();
            }

            var commandIds = [];

            var lightOn;

            // Here we are going to find the final state and but collect all the active command ids because we'll use them in a moment.
            activeCommands.forEach(function(activeCommand) {
                if (activeCommand.body.command.light > 20) {
                    lightOn = 0;
                }
                else {
                    lightOn = 1;
                }
                commandIds.push(activeCommand.id);
            });
            
            if (led != null) {
                led.write(lightOn);
            }

            // This is the response to the _lightLevel command.
            // Notice the response_to is the array of command ids from above. This is used in the obsoletes method above as well.
            var message = new nitrogen.Message({
                type: '_lightOn',
                tags: nitrogen.CommandManager.commandTag(self.device.id),
                body: {
                    command: {
                        message: "Light (" + self.device.id + ") is " + JSON.stringify(lightOn) + " at " + Date.now()
                    }
                },
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

5. Now we need to kick off the Command Manager as follows

    The filter below is an array of tags of on the messages that you're interested in. 

        ```
        SimpleCommandManager.prototype.start = function(session, callback) {

            var filter = {
                tags: nitrogen.CommandManager.commandTag(this.device.id)
            };

            return nitrogen.CommandManager.prototype.start.call(this, session, filter, callback);
        };
        ```

6. The very last bit of code is to initialize the command manager in the session start. 

    We already have a session start so modify that function as follows

        ```
        service.connect(simpleLightSensor, function(err, session, simpleLightSensor) {
        ... all of the existing code stays, just add the following

        new SimpleCommandManager(simpleLightSensor).start(session, function(err, message) {
            if (err) return session.log.error(JSON.stringify(err));

            console.log("SimpleCommandManager started.");
        });

        ```

    At this point, run your device with the command `> node connect.js` or whatever you called it. 
    
    Once it's up and running, you are ready to send commands to the device from a different laptop or just a different terminal window. Make sure to keep the johnny-five app running. 

This should act as a night light at this point in time if you have everything wired up - or you can send it commands as follows: 
    
7. Send commands as follows. 

Step one, login to n2:
 ` ./node_modules/.bin/n2 principal login n2labs@outlook.com.`

Step two, get your device ID by either logging into the portal and looking for your device in the list of devices or you can run the command `./node_modules/.bin/n2 device ls`.

The one catch here is that different operating systems parse command line JSON in different ways so look for your OS's 

Windows 8
```
`> n2 message send '{\"type\": \"_lightOn\", \"tags\":[\"command:<Your Device ID>\"], \"body\": {\"value\": \"true\"}, \"to\":\"<Your Device ID>\"}'
```

Windows 7 or prior
```
`> n2 message send "{\"type\": \"_lightOn\", \"tags\":[\"command:<Your Device ID>\"], \"body\": {\"value\": \"true\"}, \"to\":\"<Your Device ID>\"}"
```

Mac or Linux
```
`> n2 message send '{"type": "_lightOn", "tags":["command:<Your Device ID>"], "body": {"value": "true"}, "to":"<Your Device ID>"}'
```

At this point you have gotten your board prepped for Johnny-Five, a Johnny-Five app, connected to Nitrogen and received messages from Nitrogen. 

Congratulations! 

The last step is only if you have a Yun. 

[Deploy to Yun](./deploytoyun.md)