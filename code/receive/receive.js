var five = require("johnny-five");
var board = new five.Board();
var LEDPIN = 13;
var led = null;

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
    tags: ['sends:_lightLevel', 'executes:_lightLevel'],
    api_key: config.api_key
});

var service = new nitrogen.Service(config);

service.connect(simpleLightSensor, function(err, session, simpleLightSensor) {
    if (err) return console.log('failed to connect simpleLightSensor: ' + err);

    var self = this;

    new SimpleCommandManager(simpleLightSensor).start(session, function(err, message) {
        if (err) return session.log.error(JSON.stringify(err));

        console.log("SimpleCommandManager started.");
    });


    board.on("ready", function(){
      console.log("Board connected...");

      var light = new five.Sensor("A0");
    this.pinMode(LEDPIN, five.Pin.OUTPUT);
    led = new five.Pin(LEDPIN);

      light.on("change", function() {
        var lightValue = Math.round(this.value * .1);

        var message = new nitrogen.Message({
            type: '_lightLevel',
            tags: nitrogen.CommandManager.commandTag(simpleLightSensor.id),
            body: {
                command: {
                    'light': lightValue 
                }
            }, 
            to: simpleLightSensor.id
        });

        console.log("Sending: " + JSON.stringify(message));

        message.send(session);
      });      
    });
});

function SimpleCommandManager() {
    nitrogen.CommandManager.apply(this, arguments);
}

SimpleCommandManager.prototype = Object.create(nitrogen.CommandManager.prototype);
SimpleCommandManager.prototype.constructor = SimpleCommandManager;

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

SimpleCommandManager.prototype.obsoletes = function(downstreamMsg, upstreamMsg) {
    console.log("obsoletes");

    if (nitrogen.CommandManager.obsoletes(downstreamMsg, upstreamMsg))
        return true;

    var value = downstreamMsg.is("_lightOn") &&
                downstreamMsg.isResponseTo(upstreamMsg) &&
                upstreamMsg.is("_lightLevel");

    return value;
};

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

SimpleCommandManager.prototype.start = function(session, callback) {

    var filter = {
        tags: nitrogen.CommandManager.commandTag(this.device.id)
    };

    return nitrogen.CommandManager.prototype.start.call(this, session, filter, callback);
};
