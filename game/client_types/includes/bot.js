/**
 * # Bot type implementation of the game stages
 * Copyright(c) 2015 Stefano Balietti <sbalietti@ethz.ch>
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = function(node, stage, opponentDecision, settings) {
    var decision;

    // Compute the decision.
    decision = Math.random() < 0.5 ? 'red' : 'blue'; 

    // Add the response to database.
    node.game.memory.insert({
        player: 'bot',
        stage: stage,
        decision: decision,
        opponent: opponent.id
    });

    // Return decision.
    return decision;
};
