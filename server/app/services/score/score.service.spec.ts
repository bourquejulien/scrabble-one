/* eslint-disable dot-notation,
@typescript-eslint/no-unused-expressions,
@typescript-eslint/no-empty-function,
no-unused-expressions,
*/
import { DatabaseService } from '@app/services/database/database.service';
import { ScoreService } from '@app/services/score/score.service';
import { expect } from 'chai';
import { Collection, Db } from 'mongodb';
import { createSandbox, SinonSandbox, SinonStubbedInstance } from 'sinon';

describe('ScoreService', () => {
    let service: ScoreService;
    let dbServiceStub: SinonStubbedInstance<DatabaseService>;
    let sandbox: SinonSandbox;
    let collectionStub: SinonStubbedInstance<Collection>;
    beforeEach(() => {
        sandbox = createSandbox();
        dbServiceStub = sandbox.createStubInstance(DatabaseService);
        const dbStub = sandbox.createStubInstance(Db);
        dbServiceStub['scrabbleDb'] = dbStub as unknown as Db;
        collectionStub = sandbox.createStubInstance(Collection);
        collectionStub.insertOne.resolves();
        collectionStub.insertMany.resolves();
        collectionStub.deleteOne.resolves();
        collectionStub.find.resolves();
        collectionStub.findOne.resolves(undefined);
        dbStub.collection.resolves(collectionStub);
        service = new ScoreService(dbServiceStub as unknown as DatabaseService);
    });
    afterEach(() => {
        sandbox.restore();
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('should update scoreboard', async () => {
        // await service.updateScoreboard([score, score], GameMode.Log2990);
        // assert.calledOnce(collectionStub.insertMany);
    });

    it('should tell if player is in scoreboard', async () => {
        // expect(await service.isPlayerInScoreboard('id', GameMode.Classic)).to.be.true;
    });

    it('should delete element', async () => {
        // assert.calledOnce()
    });

    it('should initiate the classic collection', async () => {
        // const collectionStub = sandbox.stub(service['scrabbleDb'], 'createCollection');
        // const collectionName = Constants.DATABASE_COLLECTION_CLASSIC;
        // await service['initCollections'](collectionName);
        // sandbox.assert.calledWith(collectionStub, collectionName);
    });

    it('should initiate any other collections', async () => {
        // const collectionStub = sandbox.stub(service['scrabbleDb'], 'createCollection');
        // const collectionName = Constants.DATABASE_COLLECTION_LOG;
        // await service['initCollections'](collectionName);
        // sandbox.assert.calledWith(collectionStub, collectionName);
    });

    it('should reset', async () => {
        // const dropStubClassic = sandbox.stub(service['classicScoreboard'], 'drop');
        // const dropStubLog = sandbox.stub(service['logScoreboard'], 'drop');
        // await service['reset']();
        // sandbox.assert.calledOnce(dropStubClassic);
        // sandbox.assert.calledOnce(dropStubLog);
    });
});
