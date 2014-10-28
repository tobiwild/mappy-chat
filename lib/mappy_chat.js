'use strict';

var xmpp = require('node-xmpp');
var MessageManager = require('./message_manager');

function run(config, commands) {
    var client = new xmpp.Client(config.jabber.client);

    client.on('online', function() {
        console.log('online');
        for (var i=0; i<config.jabber.rooms.length; i++) {
            client.send(new xmpp.Element('presence', { to: config.jabber.rooms[i] +'/' + config.jabber.roomAlias }).
                    c('x', { xmlns: 'http://jabber.org/protocol/muc' }));
        }
    });

    setupRuleHandling(client, config, commands);
    setupGreetingHandling(client, config, commands);

    client.on('error', function(e) {
        console.error(e);
    });

}

function setupRuleHandling(client, config, commands) {
    var messageManager = new MessageManager(config.rules);

    function handleMessage(message, roomJid) {
        var command = commands.get(message.command);

        var commandReturn = command.run(message);

        if (typeof commandReturn === 'object') {
            commandReturn.then(function(output) {
                if (false === output) {
                    return;
                }

                var stanza = new xmpp.Element('message', {
                    to: roomJid,
                    type: 'groupchat'
                }).c('body').t(output);

                client.send(stanza);
            });
        }
    }

    client.on('stanza', function(stanza) {
        if (stanza.is('message')) {
            if (stanza.getChild('delay')) {
                return;
            }

            if (stanza.attrs.type !== 'error') {
                var m = stanza.getAttr('from').match(/^((.*?)@.*?)\/(.*)/);

                if (!m) {
                    return;
                }

                var roomJid = m[1];

                var data = {
                    user: m[3],
                    room: m[2],
                    text: stanza.getChild('body').getText(),
                };

                var message = messageManager.getMessage(data);

                if (message) {
                    handleMessage(message, roomJid);
                }
            }
        }
    });
}

function setupGreetingHandling(client, config, commands) {
    var greetingsDone = {};

    client.on('stanza', function(stanza) {
        if (! stanza.is('presence')) {
            return;
        }

        var m = stanza.getAttr('from').match(/([^\/.]+)\.([^\/.]+)$/);

        if (!m) {
            return;
        }

        var name = m[0];

        if (name in greetingsDone) {
            // only one greeting per day for same user
            if (greetingsDone[name].getDate() === (new Date()).getDate()) {
                return;
            }

            delete greetingsDone[name];
        }

        var vars = {
            forname: m[1],
            surname: m[2]
        };

        var compare = function (a, b) {
            var r = vars[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        };

        var index = Math.floor((Math.random() * config.greetings.length));
        var greeting = config.greetings[index];

        greeting = greeting.replace(/{([^{}]*)}/g, compare);

        commands.say(greeting);

        greetingsDone[name] = new Date();
    });
}

module.exports = {
    run: run
};
