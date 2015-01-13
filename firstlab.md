# First lab

In this first lab, we're going to connect to Nitrogen and send some data. Once we have that, we'll move on to receiving commands 

## Setting up your NPM prerequisites 

Node uses a install manager called the Node Package Manager (NPM) to install anything that you are dependent on in your node.js application. You can either manually run npm for each package or you can create a package.json file and install with a single command. 

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
        "nitrogen": "~0.2.21",
        "nitrogen-cli": "~0.2.8",
        "nitrogen-file-store": "~0.2.0",
        "johnny-five": "~0.8.37"
      },
      "keywords": [
        "devices",
        "iot",
        "nitrogen",
        "arduino",
        "yun",
        "arduino yun"
      ]
    }
    ```

2. Run the npm install 

    `npm install`

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

    
## Running your device

At this point you can run the app and start sending telemetry data in. What it will do is connect to Nitrogen and use your API key to get a device provisioned, save your new device identity into a file called (by default) api.nitrogen.io_443. Then it will send a message to the portal with this new identity. 

1. Run your device with the following command 

    `node blinkn2.js`

2. Log into the [Admin Portal](https://admin.nitrogen) and look at the messages tab to see your messages. 

## Summary

In this lab you've gotten your first device up and running and have connected to Nitrogen to send telemetry data in. In the next lab, we'll recieve commands from Nitrogen and react to them. 

[Next lab - receiving commands](./secondlab-receice.md)