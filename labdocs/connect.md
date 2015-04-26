# Connecting to Nitrogen

In this lab, we're going to connect to Nitrogen and send some data. Once we have that, we'll move on to receiving commands 

## Setting up your NPM prerequisites 

As you should know by now if you didn't just jump to this lab, Node uses a install manager called the Node Package Manager (NPM) to install anything that you are dependent on in your node.js application. You can either manually run npm for each package or you can create a package.json file and install with a single command. 

If you did the previous labs, you can just modify your existing package.json by adding the additional dependencies. 

1. Create a file called package.json
    
    ```
    {
      "name": "n2labs",
      "homepage": "<some url>",
      "author": "<your name>",
      "licenses": [
        {
          "type": "<Your license>",
          "url": "<Your license URL>"
        }
      ],
      "main": "./lib",
      "repository": {
        "type": "git",
        "url": "<your git repo>"
      },
      "version": "0.0.1",
      "dependencies": {
        "johnny-five": "~0.8.37",
        "nitrogen": "~0.2.21",
        "nitrogen-cli": "~0.2.8",
        "nitrogen-file-store": "~0.2.0"
     },
      "keywords": [
        "devices",
        "iot",
        "arduino",
        "yun",
        "arduino yun", 
        "nitrogen"
      ]
    }
    ```

2. Run the npm install 

    `npm install`

## Connecting to Nitrogen:

The next thing to do is to connect to Nitrogen and start sending in telemetry data. 

1. Create a file called `connectN2.js`. N2 is our shorthand for Nitrogen. 
2. Type in your requires

        ```
        var five = require("johnny-five");
        var board = new five.Board();

        var Store = require('nitrogen-file-store'),
            nitrogen = require('nitrogen');
        ```

Started with the familiar Johnny-Five. The next bit is the Nitrogen File Store which will save our credentials. The second require is Nitrogen itself. 

3. Now let's get our Nitrogen configuration ready. 
In a real app, you should put this in a config file somewhere. 

    For the API Key Below, if you are in my lab, use the following API key
    `0dec2ee8e45d4bc660a749feb8f2e978`
    
    Otherwise, you need to get an API key from the Nitrogen service following the directions at [getting your API key](./gettingyourapikey.md). 
    
    Also, make sure that the host and port are correct for your environment. The sample here is using the publicly hosted instance of Nitrogen. 

        ```
        var config = {
            host: process.env.HOST_NAME || 'api.nitrogen.io',
            http_port: process.env.PORT || 443,
            protocol: process.env.PROTOCOL || 'https',
            api_key: "<Your API key>"
        };

        config.store = new Store(config);
        ```

    If you are in a lab, make sure that you check with the instructor to attach to the correct Nitrogen host. 

4. Now we're ready to set up your device. 

    The first part is to initialize your device as follows. Be sure to change your name to something more unique to you than My Nitrogen Device. 

        ```
        var simpleLightSensor = new nitrogen.Device({
            nickname: 'simpleLightSensor',
            name: 'My Light Sensor',
            tags: ['sends:_lightLevel', 'executes:_lightOn'],
            api_key: config.api_key
        });
        ```

5. The next thing is to connect to the service

        ```
        var service = new nitrogen.Service(config);

        service.connect(simpleLightSensor, function(err, session, simpleLightSensor) {
            if (err) return console.log('failed to connect simpleLightSensor: ' + err);

            // Right here is where we turn on the board and send telemetry data in the next step
        });
        ```

        At this point, you could run the app and actually see it connect to Nitrogen and create it's credentials. That said, it won't do anything so that's kind of boring. 

3. Now let's make it send telemetry data. 

    Please refer to the [Running Johnny-Five](./runningjohnnyfive.md) to make sure you are connecting properly for your platform.  

    This bit of code goes inside the `service.connect` in place of the commend in the previous section. 

        ```
        board.on("ready", function(){
          console.log("Board connected...");

          var light = new five.Sensor("A0");

          light.on("change", function() {
            var lightValue = Math.round(this.value * .1);

            var message = new nitrogen.Message({
                type: '_lightLevel',
                body: {
                    command: {
                        'light': lightValue 
                    }
                }
            });

            console.log("Sending: " + JSON.stringify(message));

            message.send(session);
          });      
        });
        ```

    At this point we've initialized your board and are ready to connect to Nitrogen. 


## Running your device

At this point you can run the app and start sending telemetry data in. What it will do is connect to Nitrogen and use your API key to get a device provisioned, save your new device identity into a file called (by default) api.nitrogen.io_443. Then it will send a message to the portal with this new identity. 

1. Run your device with the following command 

    `node connectN2.js`

2. Log into the [Admin Portal](https://admin.nitrogen.io) and look at the messages tab to see your messages. 

or you can view those from the command line using the N2 Command Line Interface as follows:

`> n2 message ls`

## Summary

In this lab you've gotten your first device up and running and have connected to Nitrogen to send telemetry data in. In the next lab, we'll receive commands from Nitrogen and react to them. 


[Next lab - receiving commands](./receive.md)
