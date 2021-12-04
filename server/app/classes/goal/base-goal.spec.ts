/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { ManyLettersInRow } from '@app/classes/goal/goals/many-letters-in-row/many-letters-in-row';
import { expect } from 'chai';
import { BaseGoal, Goal } from '@app/classes/goal/base-goal';
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
        expect(goal.getGoalData('id')).to.eql(goalDescription);
    });

    it('should mark goal as succeeded when there is the right user id', () => {
        (goal as BaseGoal)['successId'] = 'id';
        const goalData = (goal as BaseGoal).getGoalData('id');
        expect(goalData.status).to.eql(GoalStatus.Succeeded);
    });
});
