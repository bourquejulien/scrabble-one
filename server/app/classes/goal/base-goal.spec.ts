import { describe } from 'mocha';
import { ManyLettersInRow } from '@app/classes/goal/goals/many-letters-in-row/many-letters-in-row';
import { expect } from 'chai';
import { Goal } from '@app/classes/goal/base-goal';
import { GoalData, GoalStatus } from '@common';

describe('BaseGoal', () => {
    let goal: Goal;
    beforeEach(() => {
        goal = ManyLettersInRow.generate('id');
    });

    it('should diplay', () => {
        expect(goal.shouldBeDisplayed('id')).to.be.true;
        expect(goal.shouldBeDisplayed('')).to.be.false;
    });

    it('should get info', () => {
        const goalDescription: GoalData = {
            id: 'many-letters-in-row',
            score: 50,
            name: 'Placer 5 lettres du chevalet ou plus lors de 3 tours consécutifs',
            status: GoalStatus.Pending,
            isGlobal: false,
        };
        expect(goal.getGoalData('id')).to.eq(goalDescription);
    });
});
