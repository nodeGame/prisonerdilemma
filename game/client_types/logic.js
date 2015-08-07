/**
 * # Logic type implementation of the game stages
 * Copyright(c) 2015 Stefano Balietti <sbalietti@ethz.ch>
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

"use strict";

var J = require('JSUS').JSUS;
var ngc = require('nodegame-client');
var stepRules = ngc.stepRules;
var constants = ngc.constants;
var counter = 0;

var bot = require(__dirname + '/includes/bot.js');
var matchedPlayers = require(__dirname + '/includes/matching.js');

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var node = gameRoom.node;
    var channel = gameRoom.channel;

    // Increment counter.
    counter = counter ? ++counter : settings.SESSION_ID || 1;

    // Must implement the stages here.

    stager.setOnInit(function() {
        var that;

        // Need to keep reference to `this`, because it might change
        // inside the callbacks below.
        that = this;

        // Initialize the client.
        console.log('Logic ' + node.nodename + ' starts.');

        // Matching for 6 repetitions (will be restructure in 'matching' stage).
        this.matchedPlayers = matchedPlayers;

        // Will contain the ids of connected players.
        this.ids = [];

        // Save a reference to players decisions to optmize search.
        this.lastDecisions = {};
        node.on('in.set.DATA', function(msg) {
            var s = msg.stage;
            if (s.stage > 2 && s.stage < 9 && s.step === 1) {
                that.lastDecisions[msg.from] = msg.data.decision;
            }
        });

        // Routine to compute the results of the given stage.
        // Looks into the database `node.game.memory` and goes through
        // the matched players to see what what their decision.
        // If a player was matched with a bot, the bot takes the
        // decision in this routine.
        this.computeResults = function(stage) {
            var repetition, player;
            repetition = node.game.globals.getRepetition(stage);

            // node.game.memory is a database containing all the objects
            // sent by the clients via node.done, or node.set.
            // It is organized by stage and by client id.
            node.game.memory.stage[stage].each(function(e) {
                var opponent, decisionOpponent;
                // Find opponent.
                opponent = node.game.matchedPlayers[repetition][e.player];

                // Add reference to opponent.
                e.opponent = opponent;

                // Debug.
                // console.log('Match: ', e.player, ' - ', opponent);

                // Find out decisions of matched players.
                if (opponent === 'bot') {
                    decisionOpponent = bot(node, stage, e, settings);
                }
                else {
                    if ('undefined' !== typeof that.lastDecisions[opponent]) {
                        decisionOpponent = that.lastDecisions[opponent];
                    }
                    else {
                        // Opponent might have disconnected.
                        decisionOpponent = Math.random() < 0.5 ? 'red' : 'blue';
                        e.randomOpponent = true;
                    }
                }
                e.decisionOpponent = decisionOpponent;
                e.payoff = computePayoff(repetition, e.decision,
                                         decisionOpponent);

                player = channel.registry.getClient(e.player);
                player.payoff = (player.payoff || 0) + e.payoff;

                // Send results to player.
                node.say('results', e.player, {
                    decisionOpponent: e.decisionOpponent,
                    payoff: e.payoff
                });
            });
        };

        this.printInfoStep = function() {
            var stage = node.player.stage;
            console.log('Logic: ' + node.nodename + ' rep: ' +
                        (node.game.globals.getRepetition(stage)+1) +
                        ' round: ' + stage.round);
        };

    });

    // Start extending the game steps.

    stager.extendStep('matching', {
        cb: function() {
            var i, lenI, j, lenJ, pair;
            var matchedPlayers, id1, id2;
            console.log('Matching Game round: ' + node.player.stage.round);
            // Get the list of ids of all connected players.
            this.ids = node.game.pl.id.getAllKeys();
            // Shuffle it to ensure random ordering.
            this.ids = J.shuffle(this.ids);
            // Re-structure data in a more convenient structure,
            // substituting absolute position of the matching with player ids.
            i = -1, lenI = this.matchedPlayers.length;
            matchedPlayers = new Array(lenI);
            for ( ; ++i < lenI ; ) {
                j = -1, lenJ = this.matchedPlayers[i].length;
                matchedPlayers[i] = {};
                for ( ; ++j < lenJ ; ) {
                    id1 = null, id2 = null;
                    pair = this.matchedPlayers[i][j];
                    if ('number' === typeof pair[0]) id1 = this.ids[pair[0]];
                    if ('number' === typeof pair[1]) id2 = this.ids[pair[1]];
                    if (id1) matchedPlayers[i][id1] = id2 || 'bot';
                    if (id2) matchedPlayers[i][id2] = id1 || 'bot';
                }
            }
            // Substitute matching-structure.
            this.matchedPlayers = matchedPlayers;

            console.log('Logic ' + node.nodename + ' Matching.');
        }
    });

    stager.extendStep('instructions', {
        cb: function() {
            console.log('Logic ' + node.nodename + ' Instructions.');
        }
    });

    stager.extendStep('decision', {
        cb: function() {
            // Reset last decisions.
            this.lastDecisions = {};
            this.printInfoStep();
        }
    });

    stager.extendStep('results', {
        cb: function() {
            var results, previousStage;

            previousStage = node.game.plot.previous(
                node.game.getCurrentGameStage()
            );

            this.computeResults(previousStage);

        }
    });

    stager.extendStep('end', {
        cb: function() {

            var payoffs;
            payoffs = node.game.pl.map(doCheckout);

            node.game.memory.save(channel.getGameDir() + 'data/data_' +
                                  node.nodename + '.json');

            console.log('Logic ' + node.nodename + ' End.');
        }
    });

    stager.setOnGameOver(function() {

        // Something to do.

    });

    // Here we group together the definition of the game logic.
    return {
        nodename: 'lgc' + counter,
        // Extracts, and compacts the game plot that we defined above.
        plot: stager.getState(),

    };

    // Helper functions.

    function computePayoff(repetition, decision1, decision2) {
        var p, out;
        p = settings.payoffs[repetition];
        if (decision1 === 'blue') {
            if (decision2 === 'blue') return p.payoffCooperation;
            return p.payoffSucker;
        }
        if (decision2 == 'blue') return p.payoffTemptation;
        return p.payoffDefection;
    }

    /**
     * ## doCheckout
     *
     * Checks if a player has played enough rounds, and communicates the outcome
     *
     * @param {object} p A player object with valid id
     *
     * @return {object} A payoff object as required by descil-mturk.postPayoffs.
     *   If the player has not completed enough rounds returns undefined.
     */
    function doCheckout(p) {
        var code;
        code = channel.registry.getClient(p.id);
        if (code.checkout) {
            // Will popup on the window od the client.
            node.remoteAlert('Hi! It looks like you have already ' +
                             'completed this game.', p.id);
            return;
        }
        // Computing payoff and USD.
        code.checkout = true;

        // Must have played at least half of the rounds.

        code.payoff = code.payoff || 0;
        code.usd = parseFloat(
            ((code.payoff * settings.exchangeRate).toFixed(2)),
            10);

        // Sending info to player.
        node.say('win', p.id, {
            ExitCode: code.ExitCode,
            fail: code.fail,
            payoff: code.payoff,
            usd: code.usd
        });

        return {
            AccessCode: p.id,
            Bonus: code.usd,
            BonusReason: 'Full bonus.'
        };
    }
};
