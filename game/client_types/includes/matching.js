/**
 * # Bot type implementation of the game stages
 * Copyright(c) 2015 Stefano Balietti <sbalietti@ethz.ch>
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = [

    // Round 1.
    [
        [0, 'bot'], [1, 'bot'], [2, 'bot'], [3, 'bot'], [4, 'bot'], [5, 'bot']
    ],
    // Round 2.
    [
        [0, 1], [2, 3], [4, 5]
    ],
    // Round 3.
    [
        [0, 'bot'], [1, 'bot'], [2, 'bot'], [3, 'bot'], [4, 'bot'], [5, 'bot']
    ],
    // Round 4.
    [
        [0, 3], [1, 4], [2, 5]
    ],
    // Round 5.
    [
        [0, 'bot'], [1, 'bot'], [2, 'bot'], [3, 'bot'], [4, 'bot'], [5, 'bot']
    ],
    // Round 6.
    [
        [0, 4], [1, 5], [2, 3]
    ],

    // [ [0, 'bot'], [2, 'bot'], [3, 'bot'], [4, 'bot'], [5, 'bot'] ],
    // [ [0, 5], [1, 2], [3, 4] ]
];