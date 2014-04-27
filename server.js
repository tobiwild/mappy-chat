'use strict';

var xmpp = require('node-xmpp');
var fs   = require('fs');

var MessageManager = require('./lib/message_manager').MessageManager;
var CommandFactory = require('./lib/command_factory').CommandFactory;

var config = JSON.parse(fs.readFileSync('./config.json'));

var messageManager = new MessageManager(config.rules);
var commandFactory = new CommandFactory();

var client = new xmpp.Client(config.jabber.client);

client.on('online', function() {
    console.log('online');
    for (var i=0; i<config.jabber.rooms.length; i++) {
        client.send(new xmpp.Element('presence', { to: config.jabber.rooms[i] +'/' + config.jabber.roomAlias }).
            c('x', { xmlns: 'http://jabber.org/protocol/muc' }));
    }
});

function handleMessage(message, roomJid) {
    var command = commandFactory.create(message.command);

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
