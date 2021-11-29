/* eslint-disable @typescript-eslint/naming-convention -- Config file, every field is a constant */

/**
 * To contain project related configurations.
 * Theses could eventually change.
 */
export const Config = {
    GRID: {
        GRID_SIZE: 15,
    },
    RACK_SIZE: 7,
    MAX_PLAYERS: 2,
    VIRTUAL_PLAYER: {
        SKIP_PERCENTAGE: 0.1,
        EXCHANGE_PERCENTAGE: 0.1,
        NB_ALTERNATIVES: 3,
        SCORE_RANGE: [
            { percentage: 0.4, range: { min: 0, max: 6 } },
            { percentage: 0.3, range: { min: 7, max: 12 } },
            { percentage: 0.3, range: { min: 13, max: 18 } },
        ],
    },
    SESSION: {
        REFRESH_INTERVAL_MS: 250,
    },
    MAX_SKIP_TURN: 3,
};
