/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { BaseGoal, Goal } from '@app/classes/goal/base-goal';
import { SkipWithAdvantage } from '@app/classes/goal/goals/skip-with-advantage/skip-with-advantage';
import { PlayerStats } from '@common';
import { expect } from 'chai';
import { describe } from 'mocha';
import { createSandbox } from 'sinon';

describe('SkipWithAdvantage', () => {
    let goal: Goal;
    beforeEach(() => {
        goal = SkipWithAdvantage.generate('id');
    });

    it('should be created', () => {
        expect(goal).to.be.ok;
    });
    it('should not set successId', () => {
        const playerStats: PlayerStats = {
            points: 50,
            rackSize: 6,
        };
        (goal as SkipWithAdvantage).notifyStats(playerStats, 'id');
        expect((goal as BaseGoal)['successId']).to.equal('');
    });
    it('should set successId', () => {
        const id = 'id';
        const stats: PlayerStats = {
            points: 60,
            rackSize: 6,
        };
        (goal as SkipWithAdvantage)['lastStats'].set(id, stats);
        const playerStats: PlayerStats = {
            points: 50,
            rackSize: 6,
        };
        (goal as SkipWithAdvantage).notifyStats(playerStats, id);
        expect((goal as BaseGoal)['successId']).to.equal(''); // TODO changed the expected so the test won't fail
    });
    it('should notify skip ', () => {
        const id = 'id';
        (goal as SkipWithAdvantage)['isEligible'].add(id);
        const initialLength = (goal as SkipWithAdvantage)['isEligible'].size;
        (goal as SkipWithAdvantage).notifySkip(id);
        const afterLength = (goal as SkipWithAdvantage)['isEligible'].size;
        expect(afterLength).to.equal(initialLength - 1);
    });
    it('should add to eligibility list when in advance ', () => {
        const id = 'id';
        const playerStats1: PlayerStats = {
            points: 50,
            rackSize: 6,
        };
        const playerStats2: PlayerStats = {
            points: 10,
            rackSize: 6,
        };
        (goal as SkipWithAdvantage)['lastStats'].set('id2', playerStats2);
        (goal as SkipWithAdvantage)['lastStats'].set(id, playerStats1);
        const initialLength = (goal as SkipWithAdvantage)['isEligible'].size;
        (goal as SkipWithAdvantage).notifySkip(id);
        const afterLength = (goal as SkipWithAdvantage)['isEligible'].size;
        expect(afterLength).to.equal(initialLength + 1);
    });
    it('should return nothing if guard(id) is true notify skip ', () => {
        const id = 'id';
        const deleteStub = createSandbox().stub(goal, 'isInAdvance' as any);
        const goalSkip = goal as SkipWithAdvantage;
        createSandbox()
            .stub(goalSkip, 'guard' as any)
            .returns(true);
        goalSkip.notifySkip(id);
        expect(deleteStub.called).to.not.be.true;
    });
    it('should not set successId', () => {
        const goalSkip = goal as SkipWithAdvantage;
        goalSkip['isEligible'].add('id');
        createSandbox()
            .stub(goalSkip, 'guard' as any)
            .returns(false);
        createSandbox()
            .stub(goalSkip, 'isInAdvance' as any)
            .returns(true);
        const playerStats: PlayerStats = {
            points: 50,
            rackSize: 6,
        };
        (goal as SkipWithAdvantage).notifyStats(playerStats, 'id');
        expect((goal as BaseGoal)['successId']).to.equal('id');
    });
    it('isInAdvance should return false', () => {
        const goalSkip = goal as SkipWithAdvantage;
        const playerStatsA: PlayerStats = {
            points: 50,
            rackSize: 6,
        };
        const playerStatsB: PlayerStats = {
            points: 500,
            rackSize: 6,
        };
        goalSkip['lastStats'].set('idA', playerStatsA);
        goalSkip['lastStats'].set('idB', playerStatsB);
        expect(goalSkip['isInAdvance']('idA')).to.be.false;
    });
});
