# Receiving commands from Nitrogen

In the previous lab ([connecting to Nitrogen](./connect.md)) you connected to Nitrogen and were able to send in telemetry data. In this lab, we'll connect up the second side of equation and be able to turn on and off the light remotely. 

## Receiving commands. 

Now that we have your device able to send telemetry data, let's set it up to receive commands. This is a little more involved but not terribly hard. 

1. The way that we're going to do this is to create a "command manager". 

        ```
        function SimpleManager() {
            nitrogen.CommandManager.apply(this, arguments);
        }

        SimpleManager.prototype = Object.create(nitrogen.CommandManager.prototype);
        SimpleManager.prototype.constructor = SimpleManager;
        ```
    
    At this point we've got a command manager object and we've set it's prototype to the generic nitrogen.CommandManager prototype so technically it could receive commands but by default it doesn't tell Nitrogen that it's interested in any messages. 

2. The next thing is to tell Nitrogen which messages your device is interested in. 

    The isCommand function tells Nitrogen that this is a command that you respond to and the isRelevant are messages that you want to see. 

        ```
        SimpleManager.prototype.isCommand = function(message) {
            return message.is('_lightOn');
        };

        SimpleManager.prototype.isRelevant = function(message) {
            var relevant = ( (message.is('_lightValue') || message.is('_isOn')) &&
                             (!this.device || message.from === this.device.id || message.to == this.device.id));

            return relevant;
        };
        ```

9. The next thing is to tell Nitrogen which messages you've already handled. 

    If you don't set this properly, you'll either kill messages before you've seen them or you'll always see messages that you've been sent for ever or at least until they time out. 
    
    First let the base manager try to handle it and second, try to handle it yourself. You get the two messages, the downstream and the upstream so you can check to see if it was a request response or whatever. 

        ```
        SimpleManager.prototype.obsoletes = function(downstreamMsg, upstreamMsg) {
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
                this.session.log.warn('SimpleManager::executeQueue: no active commands to execute.');
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
                        message: "Light (" + simpleLightSensor.id + ") is " + JSON.stringify(lightOn) + " at " + Date.now()
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
        };
        ```

5. Now we need to kick off the Command Manager as follows

    The filter below is an array of tags of on the messages that you're interested in. 

        ```
        SimpleManager.prototype.start = function(session, callback) {
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

            new SimpleManager(simpleLightSensor).start(session, function(err, message) {
                if (err) return session.log.error(JSON.stringify(err));
            });
        });

        ```

    At this point, run your device with the command `node blinkn2.js`. 
    
    Once it's up and running, you are ready to send commands to the device from a different laptop or just a different terminal window. Make sure to keep the johnny-five app running. 
    
7. Send commands as follows. 

Step one, login to n2:
 ` ./node_modules/.bin/n2 principal login n2labs@outlook.com.`

Step two, get your device ID by either logging into the portal and looking for your device in the list of devices or you can run the command `./node_modules/.bin/n2 device ls`.

The one catch here is that different operating systems parse command line JSON in different ways so look for your OS's 

Windows 8
```
`./node_modules/.bin/n2 message send '{\"type\": \"_lightOn\", \"tags\":[\"command:<Your Device ID>\"], \"body\": {\"value\": \"true\"}, \"to\":\"<Your Device ID>\"}'
```

Windows 7 or prior
```
`./node_modules/.bin/n2 message send "{\"type\": \"_lightOn\", \"tags\":[\"command:<Your Device ID>\"], \"body\": {\"value\": \"true\"}, \"to\":\"<Your Device ID>\"}"
```

Mac or Linux
```
`./node_modules/.bin/n2 message send '{"type": "_lightOn", "tags":["command:<Your Device ID>"], "body": {"value": "true"}, "to":"<Your Device ID>"}'
```

At this point you have gotten your board prepped for Johnny-Five, a Johnny-Five app, connected to Nitrogen and received messages from Nitrogen. 

Congratulations! 

The last step is only if you have a Yun. 

[Deploy to Yun](./deploytoyun.md)