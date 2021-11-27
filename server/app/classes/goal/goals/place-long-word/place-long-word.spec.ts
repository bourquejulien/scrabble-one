import { describe } from 'mocha';
import { expect } from 'chai';
import { BaseGoal, Goal } from '@app/classes/goal/base-goal';
import { PlaceLongWord } from '@app/classes/goal/goals/place-long-word/place-long-word';
import { ValidationFailed } from '@app/classes/validation/validation-response';
import { PlaceCorner } from '@app/classes/goal/goals/place-corner/place-corner';

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
        (goal as PlaceCorner).notifyPlacement(validationResponse, id);
        expect((goal as BaseGoal)['successId']).to.equal('');
    });
});
