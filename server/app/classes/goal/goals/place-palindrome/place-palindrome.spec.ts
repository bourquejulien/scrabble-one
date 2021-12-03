/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { expect } from 'chai';
import { BaseGoal, Goal } from '@app/classes/goal/base-goal';
import { PlacePalindrome } from '@app/classes/goal/goals/place-palindrome/place-palindrome';
import { ValidationFailed, ValidationResponse } from '@app/classes/validation/validation-response';
import { Config } from '@app/config';
import { describe } from 'mocha';

describe('PlacePalindrome', () => {
    let goal: Goal;
    beforeEach(() => {
        goal = PlacePalindrome.generate('id');
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
        (goal as PlacePalindrome).notifyPlacement(validationResponse, id);
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
        (goal as PlacePalindrome).notifyPlacement(validationResponse, id);
        expect((goal as BaseGoal)['successId']).to.equal('');
    });

    it('should set successId if there is a palindrome', () => {
        const id = 'id';
        const validationResponse: ValidationResponse = {
            placements: [{ position: { x: 7, y: 7 }, letter: 'A' }],
            score: 50,
            isSuccess: true,
            words: [
                {
                    score: 5,
                    letters: [
                        { placement: { letter: 'R', position: { x: 8, y: 8 } }, isNew: true },
                        { placement: { letter: 'A', position: { x: 9, y: 8 } }, isNew: true },
                        { placement: { letter: 'D', position: { x: 10, y: 8 } }, isNew: true },
                        { placement: { letter: 'A', position: { x: 11, y: 8 } }, isNew: true },
                        { placement: { letter: 'R', position: { x: 12, y: 8 } }, isNew: true },
                    ],
                },
            ],
        };
        (goal as PlacePalindrome).notifyPlacement(validationResponse, id);
        expect((goal as BaseGoal)['successId']).to.equal(id);
    });

    it('should not set successId if there is no palindrome', () => {
        const id = 'id';
        const validationResponse: ValidationResponse = {
            placements: [{ position: { x: 7, y: 7 }, letter: 'A' }],
            score: 50,
            isSuccess: true,
            words: [
                {
                    score: 5,
                    letters: [
                        { placement: { letter: 'R', position: { x: 8, y: 8 } }, isNew: true },
                        { placement: { letter: 'A', position: { x: 9, y: 8 } }, isNew: true },
                        { placement: { letter: 'L', position: { x: 10, y: 8 } }, isNew: true },
                        { placement: { letter: 'E', position: { x: 11, y: 8 } }, isNew: true },
                        { placement: { letter: 'R', position: { x: 12, y: 8 } }, isNew: true },
                    ],
                },
            ],
        };
        (goal as PlacePalindrome).notifyPlacement(validationResponse, id);
        expect((goal as BaseGoal)['successId']).to.equal('');
    });
});
