/**
 * # Bot for Prisoner Dilemma
 * Copyright(c) 2015 Stefano Balietti <sbalietti@ethz.ch>
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */
module.exports = function(node, stage, opponent, settings) {
    var decision;

    // Compute the decision.
    decision = Math.random() < 0.5 ? 'red' : 'blue'; 

    // Add the response to database.
    node.game.memory.insert({
        player: 'bot',
        stage: stage,
        decision: decision,
        opponent: opponent.player
    });

    // Return decision.
    return decision;
};
