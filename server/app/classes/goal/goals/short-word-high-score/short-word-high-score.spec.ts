import { describe } from 'mocha';
import { expect } from 'chai';
import { Goal } from '@app/classes/goal/base-goal';
import { ShortWordHighScore } from '@app/classes/goal/goals/short-word-high-score/short-word-high-score';

describe('ShortWordHighScore', () => {
    let goal: Goal;
    beforeEach(() => {
        goal = ShortWordHighScore.generate('id');
    });

    it('should be created', () => {
        expect(goal).to.be.ok;
    });
});
