// /* eslint-disable dot-notation,
// @typescript-eslint/no-unused-expressions,
// @typescript-eslint/no-empty-function,
// no-unused-expressions,
// */
// import { expect } from 'chai';
// import { DatabaseService } from '@app/services/database/database.service';
// import { assert, createSandbox, SinonSandbox, SinonStubbedInstance } from 'sinon';
// import { ScoreService } from '@app/services/score/score.service';
// import { Constants } from '@app/constants';
// import { Collection, Db } from 'mongodb';
// import { Score } from '@common';
//
// describe('ScoreService', () => {
//     let service: ScoreService;
//     let dbServiceStub: SinonStubbedInstance<DatabaseService>;
//     let sandbox: SinonSandbox;
//     let collectionStub: SinonStubbedInstance<Collection>;
//     const score: Score = {
//         scoreValue: 100,
//         name: 'Monique',
//     };
//     beforeEach(() => {
//         sandbox = createSandbox();
//         dbServiceStub = sandbox.createStubInstance(DatabaseService);
//         const dbStub = sandbox.createStubInstance(Db);
//         dbServiceStub['scrabbleDb'] = dbStub as unknown as Db;
//         collectionStub = sandbox.createStubInstance(Collection);
//         collectionStub.insertOne.resolves();
//         collectionStub.insertMany.resolves();
//         collectionStub.deleteOne.resolves();
//         collectionStub.find.resolves();
//         collectionStub.findOne.resolves(undefined);
//         dbStub.collection.resolves(collectionStub);
//         service = new ScoreService(dbServiceStub as unknown as DatabaseService);
//     });
//     afterEach(() => {
//         sandbox.restore();
//     });
//     it('should be created', () => {
//         expect(service).to.be.ok;
//     });
//     it('should update scoreboard', async () => {
//         await service.updateScoreboard([score, score], Constants.DATABASE_COLLECTION_CLASSIC);
//         assert.calledOnce(collectionStub.insertMany);
//     });
//     it('should tell if player is in scoreboard', async () => {
//         expect(await service.isPlayerInScoreboard('id', Constants.DATABASE_COLLECTION_CLASSIC)).to.be.true;
//     });
//     it('should delete element', async () => {
//         // assert.calledOnce()
//     });
// });
