# Light Sensor

In this first lab, we're going to connect to the device with Johnny-Five and start sending the device commands.

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
        "johnny-five": "~0.8.37"
      },
      "keywords": [
        "devices",
        "iot",
        "arduino",
        "yun",
        "arduino yun"
      ]
    }
    ```

2. Run the npm install 

    `npm install`

## Let's get coding:

The next thing to do is to set up the device in JavaScript and start talking to it. 

1. Create a file called `blinky.js`. 
2. Type in your requires. The things that are listed here are the things that this file has access to. This should match what's in your package.json file. 

        ```
        var five = require("johnny-five");
        ```

3. Now let's fill out your board initialization

    Please refer to the [Running Johnny-Five](./runningjohnnyfive.md) to make sure you are connecting properly for your platform.  

        ```
        var board = new five.Board();

        var led;

        var LEDPIN = 13; //13 is an LED on the board as well as a pin
        var ON = 1; // 1 is on

        board.on("ready", function(){
          console.log("Board connected...");

          // Set pin 13 to ON mode
          this.pinMode(LEDPIN, ON);
        });
        ```
    
## Running your device

At this point you can run the app and start your device. The Johnny-Five app will connect to the standard firmata that's on the device and start sending it commands. 

1. Run your device with the following command 

    `node blinky.js`

## Summary

In this lab you've gotten your first device up and running and are turning on the light. 

## Extra credit. 

Modify the `board.on` section to loop rather than just turn on the light. 

```
var OFF = 0;

board.on("ready", function(){
  console.log("Board connected...");

  setInterval(function() {
        if (this.pinMode(LEDPIN) == ON)
        {
          this.pinMode(LEDPIN, OFF);
        }
        else
        {
          this.pinMode(LEDPIN, ON);
        }
    }, 1000);
});
```

## Wrap up

At this point you should have a high level understanding of Johnny-Five and be ready to start receiving data from the device. 

[next lab - light sensor](./lightsensor.md)
