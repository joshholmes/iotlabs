# Light Sensor

In this lab, we're going to connect a light sensor to the device and start reading it. 

## Double check your package.json. 

If you did the [blink.js](./blinky.md) lab, you can just use the same folder and it will use the same package.json which should look like the below. 

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

## Let's get coding:

The next thing to do is to set up the device in JavaScript and start talking to it. 

1. Create a file called `lightsensor.js`. 
2. Type in your requires. The things that are listed here are the things that this file has access to. This should match what's in your package.json file. 

        ```
        var five = require("johnny-five");
        ```

3. Now let's fill out your board initialization

    Please refer to the [Running Johnny-Five](./runningjohnnyfive.md) to make sure you are connecting properly for your platform.  

        ```
        var board = new five.Board();

        board.on("ready", function(){
          console.log("Board connected...");

          var light = new five.Sensor("A0");

          light.on("change", function() {
            var lightValue = Math.round(this.value * .1);

            //JOSH - check console.write
            console.write("Light is @ " + lightValue + "%");
          });      
        });
        ```
    
## Running your device

At this point you can run the app and start your device. The Johnny-Five app will connect to the standard firmata that's on the device and start sending it commands. 

1. Run your device with the following command 

    `node lightsensor.js`

## Summary

In this lab you've gotten your device up and running and are reading the light sensor. 

Something to notice is that we are not creating a "light object" with Johnny-five. We are creating a sensor and reading that sensor. The analog sensors return a number and it's up to us to interpret the numbers to something that makes sense to us. In the next lab we'll start using this sensor reading and making interpretations on it. 

At this point you should have a high level understanding of reading sensors with Johnny-Five and be ready to move on to the next lab. 

[next lab - night light](./nightlight.md)
