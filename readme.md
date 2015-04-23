# Nitrogen Labs for the Arduino with Johnny-Five

This is a quick starter for doing a Nitrogen app on an Arduino. It's going to use Johnny-Five which allows you to run node.js on your host machine, windows, osx, linux, ..., to control your Arduino. 

All of these labs should work with the Arduino Uno, Arduino Due and the Arduino Yun. I've not tested them with other Arduinos but there's no reason they shouldn't. 

At the end of these labs, if you have a Yun you can run the app on the Yun's OpenWRT side and let it control the Arduino side. 

## Prerequisites 

You will need: 

1. [Arduino Yun](http://arduino.cc/en/Main/ArduinoBoardYun?from=Products.ArduinoYUN). 
2. And you'll need to prep your Arduino Yun. If you are in one of my labs, I've already done this for you. Otherwise, check the bottom of this page for details. 
3. Flash the Arduino with Johnny-Five - directions at [Running Johnny-Five](./labdocs/runningjohnnyfive.md)

## The next bit that you'll need is on the Nitrogen side. 

1. You'll need to install the Nitrogen client library for your laptop so you can prevision devices and send command. See the [Nitrogen starting guide](http://nitrogen.io/guides/temperature/setup.html) for more details. 

At this point you've set up Johnny-Five, flashed your Arduino, run your first Johnny-Five app and finally installed the Nitrogen client bits. 

## Labs

We've got a small series of labs that will get you started. The first will connect you to Nitrogen and get you sending messages. The second will allow you to control your device remotely. 

The first set of 3 labs is about doing stuff on the device. 

1. [Blinky](./labdocs/blinky.md)
2. [Light Sensor](./labdocs/lightsensor.md)
3. [Night light](./labdocs/nightlight.md)

The second set of three is about talking to the cloud and doing things remotely. 

4. [Connecting to Nitrogen](./labdocs/connect.md)
5. [receiving commands](./labdocs/receive.md)
6. [Deploy to your Yun](./labdocs/deploytoyun.md)
