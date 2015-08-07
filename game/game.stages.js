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

    // We build the game sequence here.
    // Players and Logic will extend it for their own purposes.

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
        .repeat('game AS session1', settings.REPEAT)
        .repeat('game AS session2', settings.REPEAT)
        .repeat('game AS session3', settings.REPEAT)
        .repeat('game AS session4', settings.REPEAT)
        .repeat('game AS session5', settings.REPEAT)
        .repeat('game AS session6', settings.REPEAT)
        .next('end')
        .gameover();


    // Sharing functions across players and logic.
    stager.setDefaultGlobals({
        getRepetition: function(stage) {
            return stage.stage - 3; // 0-based; instructions + matching;
        }
    });

    return stager.getState();
};
