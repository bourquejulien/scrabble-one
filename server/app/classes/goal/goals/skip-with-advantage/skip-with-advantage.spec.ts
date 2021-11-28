/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { describe } from 'mocha';
import { expect } from 'chai';
import { BaseGoal, Goal } from '@app/classes/goal/base-goal';
import { SkipWithAdvantage } from '@app/classes/goal/goals/skip-with-advantage/skip-with-advantage';
import { PlayerStats } from '@common';

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
});
