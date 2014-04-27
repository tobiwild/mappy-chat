'use strict';

var CommandFactory = function() {
};

CommandFactory.prototype = {
    create: function(name) {
        var exports = require('./command/' + name);

        if (typeof exports.command !== 'undefined') {
            return new exports.command();
        }

        throw new Error('command '+name+' not found');
    }
};

exports.CommandFactory = CommandFactory;