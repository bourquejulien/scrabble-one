/* eslint-disable
no-unused-expressions,
@typescript-eslint/no-unused-expressions,
no-unused-vars,
@typescript-eslint/no-empty-function,
dot-notation */
import { describe } from 'mocha';
import { expect } from 'chai';
import { GoalHandler } from '@app/handlers/goal-handler/goal-handler';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { GoalStatus, PlayerStats } from '@common';
import { BaseGoal, Goal } from '@app/classes/goal/base-goal';
import { createStubInstance } from 'sinon';

class GoalHandlerTest extends GoalHandler {
    notifyExchange(id: string): void {
        // Method to be implemented in child classes
    }

    notifyPlacement(validationResponse: ValidationResponse, id: string): void {
        // Method to be implemented in child classes
    }

    notifySkip(id: string): void {
        // Method to be implemented in child classes
    }

    notifyStats(stats: PlayerStats, id: string): void {
        // Method to be implemented in child classes
    }

    start(ids: string[]): void {
        // Method to be implemented in child classes
    }
}
describe('GoalHandler', () => {
    let handler: GoalHandler;
    const score = 100;
    beforeEach(() => {
        handler = new GoalHandlerTest();
        const goalStub = createStubInstance(BaseGoal);
        goalStub.shouldBeDisplayed.returns(true);
        goalStub.getGoalData.returns({
            id: 'id',
            score,
            name: 'Alfred',
            status: GoalStatus.Succeeded,
            isGlobal: true,
        });
        handler['goals'].push(goalStub as unknown as Goal);
    });

    it('should be created', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions,no-unused-expressions
        expect(handler).to.be.ok;
    });

    it('should get score ', () => {
        expect(handler.getScore('id')).to.equal(score);
    });
});
