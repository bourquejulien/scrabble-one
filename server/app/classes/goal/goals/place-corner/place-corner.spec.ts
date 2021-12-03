/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
import { expect } from 'chai';
import { PlaceCorner } from '@app/classes/goal/goals/place-corner/place-corner';
import { BaseGoal, Goal } from '@app/classes/goal/base-goal';
import { Config } from '@app/config';
import { ValidationFailed, ValidationResponse } from '@app/classes/validation/validation-response';

describe('PlaceCorner', () => {
    let goal: Goal;
    beforeEach(() => {
        goal = PlaceCorner.generate('id');
    });

    it('should be created', () => {
        expect(goal).to.be.ok;
    });

    it('should tell that it is on the edge', () => {
        expect(PlaceCorner['isOnEdge']({ x: Config.GRID.GRID_SIZE - 1, y: Config.GRID.GRID_SIZE - 1 })).to.be.true;
    });

    it('should tell that it is on the edge', () => {
        const id = 'id';
        const validationResponse: ValidationResponse = {
            placements: [{ position: { x: Config.GRID.GRID_SIZE - 1, y: Config.GRID.GRID_SIZE - 1 }, letter: 'A' }],
            score: 50,
            isSuccess: true,
            words: [{ score: 5, letters: [{ placement: { letter: 'A', position: { x: 8, y: 8 } }, isNew: true }] }],
        };
        (goal as PlaceCorner).notifyPlacement(validationResponse, id);
        expect((goal as BaseGoal)['successId']).to.equal(id);
    });

    it('should not set successId if it receives a validation failed answer', () => {
        const id = 'id';
        const validationResponse: ValidationFailed = {
            isSuccess: false,
            description: '',
        };
        (goal as PlaceCorner).notifyPlacement(validationResponse, id);
        expect((goal as BaseGoal)['successId']).to.equal('');
    });

    it('should not set successId if the placement is not on the edge', () => {
        const id = 'id';
        const validationResponse: ValidationResponse = {
            placements: [{ position: { x: 7, y: 7 }, letter: 'A' }],
            score: 50,
            isSuccess: true,
            words: [{ score: 5, letters: [{ placement: { letter: 'A', position: { x: 8, y: 8 } }, isNew: true }] }],
        };
        (goal as PlaceCorner).notifyPlacement(validationResponse, id);
        expect((goal as BaseGoal)['successId']).to.equal('');
    });
});
