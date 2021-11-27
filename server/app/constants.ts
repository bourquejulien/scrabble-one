/* eslint-disable @typescript-eslint/naming-convention -- Config file, every field is a constant */

/**
 * To contain general or immutable constants.
 * Theses are really unlikely to change.
 */
export const Constants = {
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        DELETED: 204,
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
    },
    MIN_DICTIONARY_SIZE: 1,
    DATABASE_COLLECTION_CLASSIC: 'classicScoreboard',
    DATABASE_COLLECTION_LOG: 'logScoreboard',
};
