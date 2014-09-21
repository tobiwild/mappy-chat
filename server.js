'use strict';

var fs = require('fs');
var commands = require('mappy-commands');
var config = JSON.parse(fs.readFileSync('./config.json'));
var mappyChat = require('./lib/mappy_chat');

mappyChat.run(config, commands);
