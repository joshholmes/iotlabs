# Light Sensor

In this lab, we're going to connect a light sensor to the device and start reading it. 

## First, let's wire up the device. 

This is where some of the fun of playing with devices starts in that we get to create a device. If you know electronics already, this is pretty trivial stuff but for the rest of us, it's a great way to learn. The Arduino platform is pretty resilient and pretty forgiving. The simple solution that we're going to use here is to wire up a "photo resister" which is a little light sensor. There's one in the Arduino starter kit which I provide with the labs. 

1. Wire from the 5v power to the power channel on the breadboard
2. Wire from the ground to the ground channel on the breadboard
3. Wire from the power channel one of the rows to start our circuit
4. On the same row, plug in the one side of the photo resister
5. Two rows over, plug in the other side of the photo resister
6. On that same row, wire from the row to the "A0" pin on the arduino
7. On that same row, plug in the 220 resister
8. Two rows over, plug in the other side of the 220 resister
9. Wire from that row to the ground channel on the breadboard

You now have a simple circuit that you can get started with. 

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
