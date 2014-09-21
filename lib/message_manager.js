'use strict';

var MessageManager = function(rules) {
    this.rules = rules;
};

MessageManager.prototype = {
    getMessage: function(data) {
        for (var i=0; i<this.rules.length; i++) {
            var message = this._getMessageFromRule(data, this.rules[i]);
            if (message !== false) {
                return message;
            }
        }

        return false;
    },

    _getMessageFromRule: function(data, rule) {
        var vars = {}, key, field;

        for (field in rule.conditions) {
            if (! (field in data)) {
                return false;
            }

            var cond  = rule.conditions[field];
            var regex = new RegExp(cond.regex, cond.modifier);

            var matches = data[field].match(regex);

            if (! matches) {
                return false;
            }

            for (var i=1; i<matches.length; i++) {
                key = field + i;

                vars[key] = matches[i];
            }
        }

        for (field in data) {
            vars[field] = data[field];
        }

        var result = {};

        var compare = function (a, b) {
            var r = vars[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        };

        for (key in rule.message) {
            result[key] = rule.message[key].replace(/{([^{}]*)}/g, compare);
        }

        return result;
    }
};

module.exports = MessageManager;
