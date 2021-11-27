import { describe } from 'mocha';
import { expect } from 'chai';
import { PlayerStatsHandler } from '@app/handlers/stats-handlers/player-stats-handler/player-stats-handler';
import { GoalHandler } from '@app/handlers/goal-handler/goal-handler';
import { createSandbox, createStubInstance } from 'sinon';
import { ValidationSucceeded } from '@app/classes/validation/validation-response';

describe('PlayerStatsHandler', () => {
    let handler: PlayerStatsHandler;
    let goalHandler: GoalHandler;
    beforeEach(() => {
        goalHandler = createStubInstance(GoalHandler) as unknown as GoalHandler;
        goalHandler['notifyStats'] = () => {};
        goalHandler['notifyPlacement'] = () => {};
        handler = new PlayerStatsHandler(goalHandler, 'id');
    });

    it('should be created', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(handler).to.be.ok;
    });

    it('should notify ', () => {
        const sandbox = createSandbox();
        const spy = sandbox.stub(handler['updateSubject'], 'next');
        const validation: ValidationSucceeded = {
            words: [],
            score: 50,
            isSuccess: true,
            placements: [{ letter: 'A', position: { x: 8, y: 8 } }],
        };
        handler.notifyPlacement(validation);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions,no-unused-expressions
        sandbox.assert.calledOnce(spy);
    });
});
