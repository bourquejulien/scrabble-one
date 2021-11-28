import { describe } from 'mocha';
import { expect } from 'chai';
import { PlayerStatsHandler } from '@app/handlers/stats-handlers/player-stats-handler/player-stats-handler';
import { GoalHandler } from '@app/handlers/goal-handler/goal-handler';
import { createSandbox, createStubInstance } from 'sinon';
import { ValidationFailed, ValidationSucceeded } from '@app/classes/validation/validation-response';
import { Observable } from 'rxjs';

describe('PlayerStatsHandler', () => {
    let handler: PlayerStatsHandler;
    let goalHandler: GoalHandler;
    beforeEach(() => {
        goalHandler = createStubInstance(GoalHandler) as unknown as GoalHandler;
        goalHandler['notifyStats'] = () => {};
        goalHandler['notifyPlacement'] = () => {}
        goalHandler['notifySkip'] = () => {};
        goalHandler['notifyExchange'] = () => {};
        handler = new PlayerStatsHandler(goalHandler, 'id');
    });

    it('should be created', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions,no-unused-expressions
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

    it('should increment skipped turns ', () => {
        const turns = handler['skippedTurns'];
        handler.notifySkip();
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions,no-unused-expressions
        expect(handler['skippedTurns']).to.eql(turns + 1);
    });

    it('should increment skipped turns ', () => {
        handler['skippedTurns'] = 9;
        handler.notifyExchange();
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions,no-unused-expressions
        expect(handler['skippedTurns']).to.eql(0);
    });

    it('should compute the correct value', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(PlayerStatsHandler['computeRackScore'](['A', 'B', 'B', 'A'])).to.eq(8);
    });

    it('should compute the correct value', () => {
        const sandbox = createSandbox();
        const spy = sandbox.stub(handler['updateSubject'], 'next');
        const rack = ['A', 'B', 'C'];
        handler.notifyRackUpdate(rack);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions,no-unused-expressions
        sandbox.assert.calledOnce(spy);
        expect(handler['rackSize']).to.eql(rack.length);
    });

    it('should not notify placement if the validation has failed', () => {

        const sandbox = createSandbox();
        const spy = sandbox.stub(handler['updateSubject'], 'next');
        const validation: ValidationFailed = {
            isSuccess: false,
            description: 'description',
        };
        handler.notifyPlacement(validation);
        sandbox.assert.notCalled(spy);
    });

    it('should return an observable', () => {
        expect(handler.onUpdate).to.be.instanceof(Observable);
    });
});
