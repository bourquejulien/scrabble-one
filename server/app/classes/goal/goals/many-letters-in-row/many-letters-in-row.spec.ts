/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
import { expect } from 'chai';
import { Goal } from '@app/classes/goal/base-goal';
import { ManyLettersInRow } from '@app/classes/goal/goals/many-letters-in-row/many-letters-in-row';
import { ValidationFailed, ValidationResponse } from '@app/classes/validation/validation-response';
import { describe } from 'mocha';

describe('ManyLettersInRow', () => {
    let goal: Goal;
    beforeEach(() => {
        goal = ManyLettersInRow.generate('id');
    });

    it('should be created', () => {
        expect(goal).to.be.ok;
    });

    it('should reset the count when notified of skip action', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        goal['consecutiveTurnCount'].set('id', 1337);
        (goal as ManyLettersInRow).notifySkip('id');
        const turns = goal['consecutiveTurnCount'].get('id');
        expect(turns).to.eq(0);
    });

    it('should reset the count when notified of exchange action', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        goal['consecutiveTurnCount'].set('id', 1337);
        (goal as ManyLettersInRow).notifyExchange('id');
        const turns = goal['consecutiveTurnCount'].get('id');
        expect(turns).to.eq(0);
    });

    it('should notify', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        goal['consecutiveTurnCount'].set('id', 1337);
        const validationResponse: ValidationResponse = {
            placements: [{ position: { x: 8, y: 8 }, letter: 'A' }],
            score: 50,
            isSuccess: true,
            words: [{ score: 5, letters: [{ placement: { letter: 'A', position: { x: 8, y: 8 } }, isNew: true }] }],
        };
        (goal as ManyLettersInRow).notifyPlacement(validationResponse, 'id');
        // const size = goal['consecutiveTurnCount'].size;
        // expect(size).to.eq(0);
    });

    it('should return early if validation is unsuccessful', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const validationResponse: ValidationFailed = {
            isSuccess: false,
            description: 'error',
        };
        (goal as ManyLettersInRow).notifyPlacement(validationResponse, 'id');
        // TODO const size = goal['consecutiveTurnCount'].size;
        // expect(size).to.eq(0);
    });

    it('should clear when the objective is met', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        goal['consecutiveTurnCount'].set('id', 5);
        const validationResponse: ValidationResponse = {
            placements: [
                { position: { x: 8, y: 8 }, letter: 'A' },
                { position: { x: 8, y: 8 }, letter: 'A' },
                { position: { x: 8, y: 8 }, letter: 'A' },
                { position: { x: 8, y: 8 }, letter: 'A' },
                { position: { x: 8, y: 8 }, letter: 'A' },
                { position: { x: 8, y: 8 }, letter: 'A' },
            ],
            score: 50,
            isSuccess: true,
            words: [{ score: 5, letters: [{ placement: { letter: 'A', position: { x: 8, y: 8 } }, isNew: true }] }],
        };
        (goal as ManyLettersInRow).notifyPlacement(validationResponse, 'id');
        // TODO const size = goal['consecutiveTurnCount'].size;
        // expect(size).to.eq(0);
    });
});
