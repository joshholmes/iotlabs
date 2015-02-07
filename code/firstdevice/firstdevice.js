var Store = require('nitrogen-file-store'),
    nitrogen = require('nitrogen');


var config = {
    host: 'api.nitrogen.io',
    http_port: 443,
    protocol: 'https',
    api_key: "0dec2ee8e45d4bc660a749feb8f2e978"
};

config.store = new Store(config);

var simpleLED = new nitrogen.Device({
    nickname: 'simpleLED',
    name: 'My LED',
    tags: ['sends:_isOn', 'executes:_lightOn'],
    api_key: config.api_key
});

var service = new nitrogen.Service(config);

service.connect(simpleLED, function(err, session, simpleLED) {
    if (err) return console.log('failed to connect simpleLED: ' + err);

    new simpleLEDManager(simpleLED).start(session, function(err, message) {
        if (err) return session.log.error(JSON.stringify(err));
    });

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


function simpleLEDManager() {
    nitrogen.CommandManager.apply(this, arguments);
}

simpleLEDManager.prototype = Object.create(nitrogen.CommandManager.prototype);
simpleLEDManager.prototype.constructor = simpleLEDManager;

simpleLEDManager.prototype.isRelevant = function(message) {
    var relevant = ( (message.is('_lightOn') || message.is('_isOn')) &&
                     (!this.device || message.from === this.device.id || message.to == this.device.id));

    return relevant;
};

simpleLEDManager.prototype.isCommand = function(message) {
    return message.is('_lightOn');
};

simpleLEDManager.prototype.obsoletes = function(downstreamMsg, upstreamMsg) {
    if (nitrogen.CommandManager.obsoletes(downstreamMsg, upstreamMsg))
        return true;

    var value = downstreamMsg.is("_isOn") &&
                downstreamMsg.isResponseTo(upstreamMsg) &&
                upstreamMsg.is("_lightOn");

    return value;
};

simpleLEDManager.prototype.executeQueue = function(callback) {
    var self = this;

    if (!this.device) return callback(new Error('no device attached to control manager.'));

    // This looks at the list of active commands and returns if there's no commands to process.
    var activeCommands = this.activeCommands();
    if (activeCommands.length === 0) {
        this.session.log.warn('SimpleLEDManager::executeQueue: no active commands to execute.');
        return callback();
    }

    var lightOn;
    var commandIds = [];

    // Here we are going to find the final state and but collect all the active command ids because we'll use them in a moment.
    activeCommands.forEach(function(activeCommand) {
        lightOn = activeCommand.body.value;
        commandIds.push(activeCommand.id);
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

simpleLEDManager.prototype.start = function(session, callback) {

    var filter = {
        tags: nitrogen.CommandManager.commandTag(this.device.id)
    };

    return nitrogen.CommandManager.prototype.start.call(this, session, filter, callback);
};
