'use strict';

var assert         = require('assert');
var MessageManager = require('../lib/message_manager');

describe('MessageManager', function() {

    var manager = null;

    describe('#getMessage()', function() {
        before(function() {
            var rules = [
                {
                    'conditions': {
                        'msg': {
                            'regex': 'stage: (.*)',
                            'modifier': 'i'
                        },
                        'user': {
                            'regex': 'buildserver',
                            'modifier': 'i'
                        }
                    },
                    'message': {
                        'text': 'Aufgepasst, {user} sagt, dass Stage was macht: {msg1}',
                        'language': 'de'
                    }
                }
            ];

            manager = new MessageManager(rules);
        });

        it('should return matching message', function() {
            var actual = manager.getMessage({
                'user': 'buildserver',
                'msg': 'Mietwagen Stage: Build erfolgreich'
            });
    
            assert.equal(actual.text, 'Aufgepasst, buildserver sagt, dass Stage was macht: Build erfolgreich');
            assert.equal(actual.language, 'de');
        });


        it('should interpolate message with vars which are not part of condition', function() {
            manager = new MessageManager([
                {
                    'conditions': {},
                    'message': {
                        'text': 'Ich bin {user}',
                        'language': 'de'
                    }
                }
            ]);

            var actual = manager.getMessage({
                'user': 'buildserver'
            });

            assert.equal(actual.text, 'Ich bin buildserver');
            assert.equal(actual.language, 'de');
        });
    });
});
