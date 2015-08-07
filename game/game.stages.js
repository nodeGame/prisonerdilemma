/**
 * # Game stages definition file
 * Copyright(c) 2015 Stefano Balietti <sbalietti@ethz.ch>
 * MIT Licensed
 *
 * Stages are defined using the stager API
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = function(stager, settings) {

    // Game is divided in blocks, stages, and steps.
    // There are several ways to define them.
    // An easy way is to add them here, and then each client type extend them.

    stager.addStep({
        id: 'decision',
        cb: function() {}
    });
    stager.addStep({
        id: 'results',
        cb: function() {}
    });

    stager.addStage({
        id: 'game',
        steps: ['decision', 'results']
    });

     stager
        .next('matching')
        .next('instructions')
        .repeat('game', settings.REPEAT)
        .next('end')
        .gameover();

    // Modify the stager to skip one stage.
    stager.skip('instructions');

    return stager.getState();
};
