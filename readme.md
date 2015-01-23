# Nitrogen Labs for the Arduino with Johnny-Five

This is a quick starter for doing a Nitrogen app on an Arduino. It's going to use Johnny-Five which allows you to run node.js on your host machine, windows, osx, linux, ..., to control your Arduino. 

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

## Labs

We've got a small series of labs that will get you started. The first will connect you to Nitrogen and get you sending messages. The second will allow you to control your device remotely. 

1. [First Lab - Connecting to Nitrogen](./labdocs/firstlab.md)
2. [Second lab - receiving commands](./labdocs/secondlab-receive.md)

3. [Deploy to your Yun](./labdocs/deploytoyun.md)