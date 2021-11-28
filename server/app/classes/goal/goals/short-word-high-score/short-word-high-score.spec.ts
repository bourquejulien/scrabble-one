import { describe } from 'mocha';
import { expect } from 'chai';
import { BaseGoal, Goal } from '@app/classes/goal/base-goal';
import { ShortWordHighScore } from '@app/classes/goal/goals/short-word-high-score/short-word-high-score';
import { ValidationFailed, ValidationResponse } from '@app/classes/validation/validation-response';
import { PlacePalindrome } from '@app/classes/goal/goals/place-palindrome/place-palindrome';
import { Config } from '@app/config';

describe('ShortWordHighScore', () => {
    let goal: Goal;
    beforeEach(() => {
        goal = ShortWordHighScore.generate('id');
    });

    it('should be created', () => {
        expect(goal).to.be.ok;
    });

    it('should not set successId if it receives a validation failed answer', () => {
        const id = 'id';
        const validationResponse: ValidationFailed = {
            isSuccess: false,
            description: '',
        };
        (goal as ShortWordHighScore).notifyPlacement(validationResponse, id);
        expect((goal as BaseGoal)['successId']).to.equal('');
    });
    it('should not set successId if there is not enough letters', () => {
        const id = 'id';
        const validationResponse: ValidationResponse = {
            placements: [{ position: { x: 7, y: 7 }, letter: 'A' }],
            score: 50,
            isSuccess: true,
            words: [
                {
                    score: 5,
                    letters: [{ placement: { letter: 'A', position: { x: Config.GRID.GRID_SIZE - 1, y: 8 } }, isNew: true }],
                },
            ],
        };
        (goal as ShortWordHighScore).notifyPlacement(validationResponse, id);
        expect((goal as BaseGoal)['successId']).to.equal('');
    });
    it('should not set successId if it receives a validation failed answer', () => {
        const id = 'id';
        const validationResponse: ValidationFailed = {
            isSuccess: false,
            description: '',
        };
        (goal as PlacePalindrome).notifyPlacement(validationResponse, id);
        expect((goal as BaseGoal)['successId']).to.equal('');
    });
    it('should not set successId if there is not enough letters', () => {
        const id = 'id';
        const validationResponse: ValidationResponse = {
            placements: [{ letter: 'R', position: { x: 8, y: 8 } }],
            score: 50,
            isSuccess: true,
            words: [
                {
                    score: 5,
                    letters: [{ placement: { letter: 'A', position: { x: Config.GRID.GRID_SIZE - 1, y: 8 } }, isNew: true }],
                },
            ],
        };
        (goal as PlacePalindrome).notifyPlacement(validationResponse, id);
        expect((goal as BaseGoal)['successId']).to.equal('');
    });
    it('should set successId if there is a short word with a high score', () => {
        const id = 'id';
        const validationResponse: ValidationResponse = {
            placements: [
                { letter: 'R', position: { x: 8, y: 8 } },
                { letter: 'A', position: { x: 9, y: 8 } },
                { letter: 'D', position: { x: 10, y: 8 } },
                { letter: 'A', position: { x: 11, y: 8 } },
                { letter: 'R', position: { x: 12, y: 8 } },
            ],
            score: 50,
            isSuccess: true,
            words: [
                {
                    score: 50,
                    letters: [{ placement: { letter: 'A', position: { x: Config.GRID.GRID_SIZE - 1, y: 8 } }, isNew: true }],
                },
            ],
        };
        (goal as ShortWordHighScore).notifyPlacement(validationResponse, id);
        expect((goal as BaseGoal)['successId']).to.equal(id);
    });
});
