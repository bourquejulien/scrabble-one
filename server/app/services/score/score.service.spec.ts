/* eslint-disable dot-notation,
@typescript-eslint/no-unused-expressions,
@typescript-eslint/no-empty-function,
no-unused-expressions,
*/
import { expect } from 'chai';
import { DatabaseService } from '@app/services/database/database.service';
import { assert, createSandbox, SinonSandbox, SinonStubbedInstance } from 'sinon';
import { ScoreService } from '@app/services/score/score.service';
import { Collection, Db, FindCursor } from 'mongodb';
import { GameMode, Score } from '@common';

const score: Score = {
    scoreValue: 100,
    name: 'Monique',
};
class Mock {
    limit() {
        return this;
    }
    toArray(): Score[] {
        return [score];
    }
    sort() {
        return this;
    }
}
describe('ScoreService', () => {
    let service: ScoreService;
    let dbServiceStub: SinonStubbedInstance<DatabaseService>;
    let sandbox: SinonSandbox;
    let collectionStub: SinonStubbedInstance<Collection>;
    let dbStub: SinonStubbedInstance<Db>;
    beforeEach(() => {
        sandbox = createSandbox();
        dbServiceStub = sandbox.createStubInstance(DatabaseService);
        dbStub = sandbox.createStubInstance(Db);
        dbServiceStub['scrabbleDb'] = dbStub as unknown as Db;
        collectionStub = sandbox.createStubInstance(Collection);
        collectionStub.insertOne.resolves(undefined);
        collectionStub.insertMany.resolves();
        collectionStub.deleteOne.resolves();
        collectionStub.find.returns(new Mock() as unknown as FindCursor);
        collectionStub.findOne.resolves(score);
        collectionStub.countDocuments.resolves(0);
        dbStub.collection.returns(collectionStub as unknown as Collection);
        service = new ScoreService(dbServiceStub as unknown as DatabaseService);
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should be created', () => {
        expect(service).to.be.ok;
    });
    it('should update scoreboard', async () => {
        await service.updateScoreboard([score, score], GameMode.Log2990);
        assert.calledOnce(collectionStub.insertMany);
    });
    it('should tell if player is in scoreboard', async () => {
        expect(await service.isPlayerInScoreboard('id', GameMode.Classic)).to.be.true;
    });
    it('should init', async () => {
        await service['init']();
        sandbox.assert.calledTwice(collectionStub.insertMany);
    });
    it('should not init if documents are present', async () => {
        collectionStub.countDocuments.resolves(1);
        await service['init']();
        sandbox.assert.notCalled(collectionStub.insertMany);
    });
    it('should reset', async () => {
        await service['reset']();
        sandbox.assert.calledTwice(collectionStub.drop);
    });
    it('should get the classic scoreboard', async () => {
        expect(await service.getScoreboardClassic()).to.deep.equal([score]);
    });
    it('should get the log scoreboard', async () => {
        expect(await service.getScoreboardLog()).to.deep.equal([score]);
    });
    it('should delete document', async () => {
        await service['deleteElement']('id', GameMode.Classic);
        sandbox.assert.calledOnce(collectionStub.deleteOne);
    });
    it('should get the score', async () => {
        expect(await service['getPlayerScore']('id', GameMode.Classic)).to.equal(score.scoreValue);
        sandbox.assert.calledOnce(collectionStub.findOne);
    });
    it('should get the score of zero', async () => {
        collectionStub.findOne.resolves(null);
        expect(await service['getPlayerScore']('id', GameMode.Classic)).to.equal(-1);
        sandbox.assert.calledOnce(collectionStub.findOne);
    });
});
