/**
 * # Game settings definition file
 * Copyright(c) 2015 Stefano Balietti <sbalietti@ethz.ch>
 * MIT Licensed
 *
 * The variables in this file will be sent to each client and saved under:
 *
 *   `node.game.settings`
 *
 * The name of the chosen treatment will be added as:
 *
 *   `node.game.settings.treatmentName`
 *
 * http://www.nodegame.org
 * ---
 */
module.exports = {

    // Variables shared by all treatments.

    // Session counter.
    SESSION_ID: 1,

    // Numnber of game rounds repetitions.
    REPEAT: 10,

    // Show up fee.
    showupFee: 1,

    // Conversion rate ECU to DOLLARS.
    exchangeRate: 0.01,

    // Timer for each step in milliseconds.
    timer: {
        instructions: 60000,
        decision: 30000,
        results: 20000,
        matching : 3000
    },

    payoffs: [
        // Round 1.
        {
            budget: 100,
            payoffSucker: 0,
            payoffDefection: 2,
            payoffTemptation: 4,
            payoffCooperation: 8
        },
        
        // Round 2.
        {
            budget: 100,
            payoffSucker: 0,
            payoffDefection: 2,
            payoffTemptation: 2,
            payoffCooperation: 4
        },

        // Round 3.
        {
            budget: 100,
            payoffSucker: 0,
            payoffDefection: 0,
            payoffTemptation: 2,
            payoffCooperation: 4
        },

        // Round 4.
        {
            budget: 50,
            payoffSucker: 0,
            payoffDefection: 0,
            payoffTemptation: 2,
            payoffCooperation: 4
        },

        // Round 5.
        {
            budget: 20,
            payoffSucker: 0,
            payoffDefection: 0,
            payoffTemptation: 2,
            payoffCooperation: 4
        },

        // Round 6.
        {
            budget: 10,
            payoffSucker: 0,
            payoffDefection: 0,
            payoffTemptation: 2,
            payoffCooperation: 4
        }
    ],

    // Treatments definition.

    // They can contain any number of properties, and also overwrite
    // those defined above.

    // If the `treatments` object is missing a treatment named _standard_
    // will be created automatically, and will contain all variables.

    treatments: {

        standard: {
            fullName: "Standard Treatment",
            description: "This is the standard treatment"
        }

    }
};
