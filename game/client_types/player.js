/**
 * # Player type implementation of the game stages
 * Copyright(c) 2015 Stefano Balietti <sbalietti@ethz.ch>
 * MIT Licensed
 *
 * Each client type must extend / implement the stages defined in `game.stages`.
 * Upon connection each client is assigned a client type and it is automatically
 * setup with it.
 *
 * http://www.nodegame.org
 * ---
 */

"use strict";

var ngc = require('nodegame-client');
var stepRules = ngc.stepRules;
var constants = ngc.constants;
var publishLevels = constants.publishLevels;

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var game;

    // Store a reference to the number of players in the globals object.
    // The globals object is sent to the client, and it is available under
    // node.game.globals.
    stager.setDefaultGlobals({
        totPlayers: gameRoom.game.waitroom.GROUP_SIZE
    }, true);

    stager.setOnInit(function() {

        // Initialize the client.

        var header, frame, s;

        // Some utility functions and variables;

        node.game.lastDecision = null;

        this.randomDecision = function() {
            if (Math.random() < 0.5) node.game.decisionMade('red');
            else node.game.decisionMade('blue');
        };

        this.decisionMade = function(type) {
            node.game.lastDecision = type;
            // Whatever parameter is passed to node.done is also sent to
            // the server, together with the time duration from the beginning
            // of the step, and whether the time expired or not.
            node.done({ decision: type });
        };

        this.getPayoffTable = function(r) {
            var p;
            // Populate table.
            p = this.settings.payoffs[r];

            this.payoffTable.clear(true);

            this.payoffTable.addRow([
                p.payoffDefection + ', ' + p.payoffDefection,
                p.payoffSucker + ', ' + p.payoffTemptation
            ]);
            this.payoffTable.addRow([
                p.payoffTemptation + ', ' + p.payoffSucker,
                p.payoffCooperation + ', ' + p.payoffCooperation
            ]);
            this.payoffTable.setHeader(['You choose Red', 'You choose Blue']);
            this.payoffTable.setLeft([
                'Other player chooses Red', 'Other player chooses Blue'
            ]);

            // The .parse method returns the HTML table element
            // containing the data added to the Table object in init.
            return this.payoffTable.parse();
        };

        this.autoPlay = function(decision) {
            // For testing/debugging only.
            node.env('auto', function() {
                if (node.env('allowDisconnect') && Math.random() < 0.5) {
                    node.socket.disconnect();
                    node.game.stop();
                    node.timer.randomExec(function() {
                        node.socket.reconnect();
                    }, 4000);
                }
                else {
                    if (!node.env('allowTimeup') ||
                        Math.random() < 0.5) {

                        node.timer.randomExec(function() {
                            if (decision) node.game.randomDecision();
                            else node.done();
                        }, 3000);                        
                    }
                }
            });
        };

        // Registering event handlers valid throughout the game.

        // Clean up stage upon stepping into the next one.
        node.on('STEPPING', function() {
            W.clearFrame();
        });

        // Display an alert in case of disconnection.
        // node.on('SOCKET_DISCONNECT', function() {
        //     alert('Disconnection from server detected.\n' +
        //         'You might not be able to send and receive messages.');
        // });


        // Setup page: header + frame.

        header = W.generateHeader();
        frame = W.generateFrame();

        // Add widgets.
        this.visualRound = node.widgets.append('VisualRound', header);
        this.timer = node.widgets.append('VisualTimer', header);

        // Add payoff table.

        this.payoffTable = new W.Table({ id: 'table-decision' });

    });

    stager.extendStep('instructions', {
        cb: function() {

            // Load the instructions page as it is
            // from the `/public` directory of this game.
            W.loadFrame('instructions.htm', function() {

                var button, n;
                n = node.game.globals.totPlayers;
                // W is the nodeGame object controlling the window.
                // It offers several methods to search, fetch, and modify
                // the structure and the elements on the page and the internal
                // iframe where all the pages are loaded.
                W.getElementById('playerCount').innerHTML = n;

                // When the user clicks the button, signals that it can
                // advance to the next stage.
                button = W.getElementById('read');
                button.onclick = function() {
                    node.done();
                };

                // Debugging and Testing.
                this.autoPlay();
            });
        },
        // Set the maximum execution time for this stage.
        // Notice: the time is client-side. This is the **effective** time
        // that the stage will be visible on the client. If a machine is
        // slower, or has worse internet connection, the stage will start
        // a bit later, but it will anyway last the same amount of time.
        timer: settings.timer.instructions
    });

     stager.extendStep('matching', {
         cb: function() {
             setTimeout(function() {
                 node.done();
             }, 1000);
         }
     });

    stager.extendStep('decision', {
        cb: function() {
            W.loadFrame('decision.htm', function() {
                var repetition, budget, table;
                var blueButton, redButton;

                // node.player contains generic info about the client,
                // including its current stage of the game.
                repetition = node.game.globals.getRepetition(node.player.stage);

                // Sets the budget.
                budget = node.game.settings.payoffs[repetition].budget;
                W.getElementById('mybudget').innerHTML = budget;

                // Get the payoff settings for this repetition.
                table = this.getPayoffTable(repetition);

                // Add the payoff matrix to the frame.
                W.getElementById('payoffMatrixDiv').appendChild(table);

                // Intercept user action.

                blueButton = W.getElementById('blueButton');
                redButton = W.getElementById('redButton');

                blueButton.onclick = function() {
                    node.game.decisionMade('blue');
                };
                redButton.onclick = function() {
                    node.game.decisionMade('red');
                };

                // Debugging and Testing.
                this.autoPlay(true);
            });
        },
        timer: {
            milliseconds: settings.timer.decision,
            timeup: function() {
                node.game.randomDecision();
            }
        }
    });

    stager.extendStep('results', {
        cb: function() {
            W.loadFrame('results.htm', function() {
                var button, choice, payoff, other;

                button = W.getElementById('continue');
                choice = W.getElementById('choice');
                payoff = W.getElementById('payoff');
                other = W.getElementById('other');

                choice.innerHTML = node.game.lastDecision;

                node.on.data('results', function(msg) {
                    other.innerHTML = msg.data.decisionOpponent;
                    payoff.innerHTML = msg.data.payoff;

                    // When the user clicks the button, signals that it can
                    // advance to the next stage.
                    button.disabled = false;
                    button.onclick = function() {
                        node.done();
                    };
                });

                // Debugging and Testing.
                this.autoPlay();

            });
        },
        timer: settings.timer.results
    });


    stager.extendStep('end', {
        // frame: 'end.htm',
        cb: function() {
            // Reset visual timer (hack).
            node.game.timer.startTiming({milliseconds: 5000});
            node.game.timer.setToZero();

            W.loadFrame('end.htm', function() {
                var spanCode;

                spanCode= W.getElementById('span-code');
                spanCode.innerHTML = node.player.id;

                node.on.data('win', function(msg) {
                    var spanFee, spanEcu, spanDollars, exitCode;

                    console.log(msg.data);

                    spanFee = W.getElementById('span-fee');
                    spanFee.innerHTML = node.game.settings.showupFee;

                    spanEcu = W.getElementById('span-ecu');
                    spanDollars = W.getElementById('span-dollars');

                    spanEcu.innerHTML = parseFloat(msg.data.payoff, 10)
                        .toFixed(2);
                    spanDollars.innerHTML = msg.data.usd;

                    if (msg.data.ExitCode) {
                        exitCode = W.getElementById('exit-code');
                        exitCode.innerHTML = msg.data.ExitCode;
                    }

                    W.getElementById('win').style.display = '';

                });

                // Remove warning for closing the tab.
                W.restoreOnleave();

                // Debugging and Testing.
                this.autoPlay();
            });

        }
    });

    // Building the return object.
    game = setup;
    game.plot = stager.getState();
    return game;
};
