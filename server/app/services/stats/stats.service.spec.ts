/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers, */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { EndGameData } from '@app/classes/end-game-data';
import { ScoreService } from '@app/services/score/score.service';
import { StatsService } from '@app/services/stats/stats.service';
import { GameMode, Score } from '@common';
import { expect } from 'chai';
import { assert, createStubInstance, SinonStubbedInstance, spy } from 'sinon';

describe('StatsService', () => {
    let service: StatsService;
    let scoreServiceStub: SinonStubbedInstance<ScoreService>;
    let endGameDataClassic: EndGameData;
    let endGameDataLog: EndGameData;

    const classicScore: Score[] = [
        { name: 'Tristan', scoreValue: 15 },
        { name: 'Albert', scoreValue: 10 },
    ];

    const logScore: Score[] = [
        { name: 'Wayne', scoreValue: 25 },
        { name: 'Bruce', scoreValue: 20 },
    ];

    beforeEach(() => {
        endGameDataClassic = { gameMode: GameMode.Classic, scores: classicScore };
        endGameDataLog = { gameMode: GameMode.Log2990, scores: logScore };
        scoreServiceStub = createStubInstance(ScoreService);
        service = new StatsService(scoreServiceStub as unknown as ScoreService);
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('should not update classic board if current score in board greater than endGame score', async () => {
        scoreServiceStub['isPlayerInScoreboard'].resolves(true);
        scoreServiceStub['getPlayerScore'].resolves(30);

        await service.updateScoreboards(endGameDataClassic);
        assert.notCalled(scoreServiceStub['updateScoreboard']);
    });

    it('should not update log board if current score in board greater than endGame score', async () => {
        scoreServiceStub['isPlayerInScoreboard'].resolves(true);
        scoreServiceStub['getPlayerScore'].resolves(30);

        await service.updateScoreboards(endGameDataLog);
        assert.notCalled(scoreServiceStub['updateScoreboard']);
    });

    it('should update classic board if not already in board', async () => {
        scoreServiceStub['isPlayerInScoreboard'].resolves(false);

        await service.updateScoreboards(endGameDataClassic);
        assert.called(scoreServiceStub['updateScoreboard']);
    });

    it('should update log board if not already in board', async () => {
        scoreServiceStub['isPlayerInScoreboard'].resolves(false);

        await service.updateScoreboards(endGameDataLog);
        assert.called(scoreServiceStub['updateScoreboard']);
    });

    it('should sort elements in classic scoreboard', async () => {
        scoreServiceStub['getScoreboardClassic'].resolves(classicScore);
        const spyFunction = spy(Array.prototype, 'sort');
        await service.getScoreToDisplay(GameMode.Classic);
        assert.called(spyFunction);
        spyFunction.restore();
    });

    it('should sort elements in log scoreboard', async () => {
        scoreServiceStub['getScoreboardLog'].resolves(logScore);
        const spyFunction = spy(Array.prototype, 'sort');
        await service.getScoreToDisplay(GameMode.Log2990);
        assert.called(spyFunction);
        spyFunction.restore();
    });

    it('should join elements names with same score in classic scoreboard', async () => {
        const classicScoreSameScores: Score[] = [
            { name: 'Ronald', scoreValue: 8 },
            { name: 'McDonald', scoreValue: 8 },
        ];
        scoreServiceStub['getScoreboardClassic'].resolves(classicScoreSameScores);
        const spyFunction = spy(Array.prototype, 'join');
        await service.getScoreToDisplay(GameMode.Classic);
        assert.called(spyFunction);
        spyFunction.restore();
    });

    it('should join elements names with same score in log scoreboard', async () => {
        const logScoreSameScores: Score[] = [
            { name: 'Fineas', scoreValue: 10 },
            { name: 'Ferb', scoreValue: 10 },
        ];

        scoreServiceStub['getScoreboardLog'].resolves(logScoreSameScores);
        const spyFunction = spy(Array.prototype, 'join');
        await service.getScoreToDisplay(GameMode.Log2990);
        assert.called(spyFunction);
        spyFunction.restore();
    });

    it('should return correct array of classic scores to display', async () => {
        scoreServiceStub['getScoreboardClassic'].resolves(classicScore);

        const scores = await service.getScoreToDisplay(GameMode.Classic);
        expect(scores).to.deep.equal(classicScore);
    });

    it('should return correct array of scores of log score to display', async () => {
        scoreServiceStub['getScoreboardLog'].resolves(logScore);

        const scores = await service.getScoreToDisplay(GameMode.Log2990);
        expect(scores).to.deep.equal(logScore);
    });

    it('should remove score from classic scoreboard if endgameData score greater', async () => {
        scoreServiceStub['isPlayerInScoreboard'].resolves(true);
        scoreServiceStub['getPlayerScore'].resolves(5);

        await service.updateScoreboards(endGameDataClassic);
        assert.called(scoreServiceStub['deleteElement']);
    });

    it('should remove score from log scoreboard if endgameData score greater', async () => {
        scoreServiceStub['isPlayerInScoreboard'].resolves(true);
        scoreServiceStub['getPlayerScore'].resolves(5);

        await service.updateScoreboards(endGameDataLog);
        assert.called(scoreServiceStub['deleteElement']);
    });
});
