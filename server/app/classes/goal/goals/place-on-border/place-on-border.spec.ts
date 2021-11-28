/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { describe } from 'mocha';
import { expect } from 'chai';
import { BaseGoal, Goal } from '@app/classes/goal/base-goal';
import { PlaceOnBorder } from '@app/classes/goal/goals/place-on-border/place-on-border';
import { ValidationFailed, ValidationResponse } from '@app/classes/validation/validation-response';
import { Config } from '@app/config';

describe('PlaceOnBorder', () => {
    let goal: Goal;
    beforeEach(() => {
        goal = PlaceOnBorder.generate('id');
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
        (goal as PlaceOnBorder).notifyPlacement(validationResponse, id);
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
                    letters: [{ placement: { letter: 'A', position: { x: Config.GRID.GRID_SIZE - 1, y: 8 } }, isNew: true }],
                },
            ],
        };
        (goal as PlaceOnBorder).notifyPlacement(validationResponse, id);
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
        (goal as PlaceOnBorder).notifyPlacement(validationResponse, id);
        expect((goal as BaseGoal)['successId']).to.equal('');
    });
});
