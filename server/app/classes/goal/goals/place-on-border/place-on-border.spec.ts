import { describe } from 'mocha';
import { expect } from 'chai';
import { Goal } from '@app/classes/goal/base-goal';
import { PlaceOnBorder } from '@app/classes/goal/goals/place-on-border/place-on-border';

describe('PlaceOnBorder', () => {
    let goal: Goal;
    beforeEach(() => {
        goal = PlaceOnBorder.generate('id');
    });

    it('should be created', () => {
        expect(goal).to.be.ok;
    });
});
