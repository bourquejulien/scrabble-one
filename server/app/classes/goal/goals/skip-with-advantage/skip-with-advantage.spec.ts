import { describe } from 'mocha';
import { expect } from 'chai';
import { Goal } from '@app/classes/goal/base-goal';
import { SkipWithAdvantage } from '@app/classes/goal/goals/skip-with-advantage/skip-with-advantage';

describe('SkipWithAdvantage', () => {
    let goal: Goal;
    beforeEach(() => {
        goal = SkipWithAdvantage.generate('id');
    });

    it('should be created', () => {
        expect(goal).to.be.ok;
    });
});
