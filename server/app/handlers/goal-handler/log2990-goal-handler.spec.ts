/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-vars */
import { describe } from 'mocha';
import { expect } from 'chai';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { Log2990GoalHandler } from '@app/handlers/goal-handler/log2990-goal-handler';
import { Goal } from '@app/classes/goal/base-goal';
import { GoalStatus, PlayerStats } from '@common';
import { ExchangeNotifier } from '@app/classes/goal/notifiers/exchange-notifier';
import { SkipNotifier } from '@app/classes/goal/notifiers/skip-notifier';
import { PlacementNotifier } from '@app/classes/goal/notifiers/placement-notifier';
import { StatsNotifier } from '@app/classes/goal/notifiers/stats-notifier';
import { createSandbox, SinonSandbox, SinonStub } from 'sinon';

class GoalStub implements ExchangeNotifier, SkipNotifier, PlacementNotifier, StatsNotifier {
    notifyExchange(id: string) {
        //
    }
    notifyPlacement(validationResponse: ValidationResponse, id: string) {
        //
    }
    notifySkip(id: string) {
        //
    }
    notifyStats(stats: PlayerStats, id: string) {
        //
    }
    shouldBeDisplayed() {
        return true;
    }
    getGoalData() {
        return {
            id: 'id',
            score: 100,
            name: 'Alfred',
            status: GoalStatus.Succeeded,
            isGlobal: true,
        };
    }
}

describe('Log2990GoalHandler', () => {
    let handler: Log2990GoalHandler;
    let sandbox: SinonSandbox;
    let notifyExchange: SinonStub;
    let notifyStats: SinonStub;
    let notifyPlacement: SinonStub;
    let notifySkip: SinonStub;
    beforeEach(() => {
        sandbox = createSandbox();
        const goalStub = new GoalStub();
        notifyExchange = sandbox.stub(goalStub, 'notifyExchange');
        notifyStats = sandbox.stub(goalStub, 'notifyStats');
        notifyPlacement = sandbox.stub(goalStub, 'notifyPlacement');
        notifySkip = sandbox.stub(goalStub, 'notifySkip');
        handler = new Log2990GoalHandler();
        handler['goals'].push(goalStub as unknown as Goal);
    });

    it('should be created', () => {
        expect(handler).to.be.ok;
    });

    it('should start', () => {
        handler.start(['id']);
    });

    it('should call notify skip', () => {
        handler.notifySkip('id');
        sandbox.assert.calledOnce(notifySkip);
    });

    it('should call notify exchange', () => {
        handler.notifyExchange('id');
        sandbox.assert.calledOnce(notifyExchange);
    });

    it('should notify placement', () => {
        const validationResponse: ValidationResponse = {
            placements: [{ position: { x: 8, y: 8 }, letter: 'A' }],
            score: 50,
            isSuccess: true,
            words: [{ score: 5, letters: [{ placement: { letter: 'A', position: { x: 8, y: 8 } }, isNew: true }] }],
        };
        handler.notifyPlacement(validationResponse, 'id');
        sandbox.assert.calledOnce(notifyPlacement);
    });
    it('should notify stats', () => {
        handler.notifyStats({} as unknown as PlayerStats, 'id');
        sandbox.assert.calledOnce(notifyStats);
    });
});
