var five = require("johnny-five");
var board = new five.Board();

var Store = require('nitrogen-file-store'),
    nitrogen = require('nitrogen');

var config = {
    host: 'localhost',
    http_port: 3030,
    protocol: 'http',
    api_key: "10c2d3aab80cf898c831cb8314168aeb"
};

config.store = new Store(config);

var simpleLightSensor = new nitrogen.Device({
    nickname: 'simpleLightSensor',
    name: 'My Light Sensor',
    tags: ['sends:_lightLevel', 'executes:_lightOn'],
    api_key: config.api_key
});

var service = new nitrogen.Service(config);

service.connect(simpleLightSensor, function(err, session, simpleLightSensor) {
    if (err) return console.log('failed to connect simpleLightSensor: ' + err);

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
});