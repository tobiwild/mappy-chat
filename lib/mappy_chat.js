'use strict';

var xmpp = require('node-xmpp');
var MessageManager = require('./message_manager');

function run(config, commands) {
    var messageManager = new MessageManager(config.rules);
    var client = new xmpp.Client(config.jabber.client);

    client.on('online', function() {
        console.log('online');
        for (var i=0; i<config.jabber.rooms.length; i++) {
            client.send(new xmpp.Element('presence', { to: config.jabber.rooms[i] +'/' + config.jabber.roomAlias }).
                    c('x', { xmlns: 'http://jabber.org/protocol/muc' }));
        }
    });

    var commandInstances = {};

    function handleMessage(message, roomJid) {
        if (! (message.command in commandInstances)) {
            commandInstances[message.command] =  new commands[message.command]();
        }

        var command = commandInstances[message.command];

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

    client.on('error', function(e) {
        console.error(e);
    });
}

module.exports = {
    run: run
};
