/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { expect } from 'chai';
import { BaseGoal, Goal } from '@app/classes/goal/base-goal';
import { PlaceLongWord } from '@app/classes/goal/goals/place-long-word/place-long-word';
import { ValidationFailed, ValidationResponse } from '@app/classes/validation/validation-response';

describe('PlaceLongWord', () => {
    let goal: Goal;
    beforeEach(() => {
        goal = PlaceLongWord.generate('id');
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
        (goal as PlaceLongWord).notifyPlacement(validationResponse, id);
        expect((goal as BaseGoal)['successId']).to.equal('');
    });
    it('should set successId if there is a long word', () => {
        const id = 'id';
        const validationResponse: ValidationResponse = {
            placements: [{ position: { x: 7, y: 7 }, letter: 'A' }],
            score: 50,
            isSuccess: true,
            words: [
                {
                    score: 5,
                    letters: [
                        { placement: { letter: 'A', position: { x: 8, y: 8 } }, isNew: true },
                        { placement: { letter: 'B', position: { x: 8, y: 8 } }, isNew: true },
                        { placement: { letter: 'B', position: { x: 8, y: 8 } }, isNew: true },
                        { placement: { letter: 'B', position: { x: 8, y: 8 } }, isNew: true },
                        { placement: { letter: 'B', position: { x: 8, y: 8 } }, isNew: true },
                        { placement: { letter: 'B', position: { x: 8, y: 8 } }, isNew: true },
                        { placement: { letter: 'B', position: { x: 8, y: 8 } }, isNew: true },
                        { placement: { letter: 'B', position: { x: 8, y: 8 } }, isNew: true },
                        { placement: { letter: 'B', position: { x: 8, y: 8 } }, isNew: true },
                    ],
                },
            ],
        };
        (goal as PlaceLongWord).notifyPlacement(validationResponse, id);
        expect((goal as BaseGoal)['successId']).to.equal(id);
    });
    it('should set successId if there is a long word', () => {
        const id = 'id';
        const validationResponse: ValidationResponse = {
            placements: [{ position: { x: 7, y: 7 }, letter: 'A' }],
            score: 50,
            isSuccess: true,
            words: [
                {
                    score: 5,
                    letters: [{ placement: { letter: 'A', position: { x: 8, y: 8 } }, isNew: true }],
                },
            ],
        };
        (goal as PlaceLongWord).notifyPlacement(validationResponse, id);
        expect((goal as BaseGoal)['successId']).to.equal('');
    });
});
