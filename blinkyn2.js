var nitrogen = require('nitrogen');
var five = require("johnny-five");
var fiveinit = require("./johnny-five-board-init");

var board = fiveinit.getBoard();

var Store = require('nitrogen-file-store');

var LEDPIN = 13;
var OUTPUT = 1;

var config = {
    host: process.env.HOST_NAME || 'api.nitrogen.io',
    http_port: process.env.PORT || 443,
    protocol: process.env.PROTOCOL || 'https',
    api_key: "0dec2ee8e45d4bc660a749feb8f2e978"
};

var led;

config.store = new Store(config);

var simpleLED = new nitrogen.Device({
    nickname: 'simpleLED',
    name: 'My Nitrogen Device',
    tags: ['sends:_isOn', 'executes:_lightOn'],
    api_key: config.api_key
});

board.on("ready", function(){
  console.log("Board connected...")

  // Set pin 13 to OUTPUT mode
  this.pinMode(LEDPIN, OUTPUT);
});


function simpleManager() {
    nitrogen.CommandManager.apply(this, arguments);
}

simpleManager.prototype = Object.create(nitrogen.CommandManager.prototype);
simpleManager.prototype.constructor = simpleManager;

simpleManager.prototype.isCommand = function(message) {
    return message.is('_lightOn');
};

simpleManager.prototype.obsoletes = function(downstreamMsg, upstreamMsg) {
    if (nitrogen.CommandManager.obsoletes(downstreamMsg, upstreamMsg))
        return true;

    var value = downstreamMsg.is("_isOn") &&
                downstreamMsg.isResponseTo(upstreamMsg) &&
                upstreamMsg.is("_lightOn");

    return value;
};

simpleManager.prototype.isRelevant = function(message) {
    var relevant = ( (message.is('_lightOn') || message.is('_isOn')) &&
                     (!this.device || message.from === this.device.id || message.to == this.device.id));

    return relevant;
};

simpleManager.prototype.executeQueue = function(callback) {
    var self = this;

    if (!this.device) return callback(new Error('no device attached to control manager.'));

    // This looks at the list of active commands and returns if there's no commands to process.
    var activeCommands = this.activeCommands();
    if (activeCommands.length === 0) {
        this.session.log.warn('simpleManager::executeQueue: no active commands to execute.');
        return callback();
    }

    var lightOn;
    var commandIds = [];

    // Here we are going to find the final state and but collect all the active command ids because we'll use them in a moment.
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
    // Notice the response_to is the array of command ids from above. This is used in the obsoletes method above as well.
    var message = new nitrogen.Message({
        type: '_isOn',
        tags: nitrogen.CommandManager.commandTag(self.device.id),
        body: {
            command: {
                message: "Light (" + simpleLED.id + ") is " + JSON.stringify(lightOn) + " at " + Date.now()
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

simpleManager.prototype.start = function(session, callback) {

    var filter = {
        tags: nitrogen.CommandManager.commandTag(this.device.id)
    };

    return nitrogen.CommandManager.prototype.start.call(this, session, filter, callback);
};


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

    new simpleManager(simpleLED).start(session, function(err, message) {
        if (err) return session.log.error(JSON.stringify(err));
    });

});

