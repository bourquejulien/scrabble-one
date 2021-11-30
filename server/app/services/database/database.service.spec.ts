/* eslint-disable dot-notation,
@typescript-eslint/no-unused-expressions,
@typescript-eslint/no-empty-function,
no-unused-expressions,
*/
import { expect } from 'chai';
import { DatabaseService } from '@app/services/database/database.service';
import Sinon, { createSandbox, SinonSandbox } from 'sinon';
import { Collection, Db, MongoClient } from 'mongodb';
import { Constants } from '@app/constants';

describe('DataBaseService', () => {
    let service: DatabaseService;
    let sandbox: SinonSandbox;
    let mongoClientStub: Sinon.SinonStubbedInstance<MongoClient>;
    let dbStub: Sinon.SinonStubbedInstance<Db>;
    beforeEach(() => {
        sandbox = createSandbox();
        mongoClientStub = sandbox.createStubInstance(MongoClient);
        dbStub = sandbox.createStubInstance(Db);
        Object.setPrototypeOf(
            MongoClient,
            sandbox.stub().callsFake(() => {}),
        );
        mongoClientStub.connect.resolves({});
        mongoClientStub.close.resolves({});
        Object.setPrototypeOf(
            Db,
            sandbox.stub().callsFake(() => {}),
        );
        dbStub.createCollection.resolves({});
        dbStub.command.resolves({});
        sandbox.stub(Collection.prototype, 'insertMany').resolves(undefined);
        service = new DatabaseService();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should be created', () => {
        expect(service).to.be.ok;
    });
    it('should initiate the classic collection', async () => {
        const collectionStub = sandbox.stub(service['scrabbleDb'], 'createCollection');
        const collectionName = Constants.DATABASE_COLLECTION_CLASSIC;
        await service['initCollections'](collectionName);
        sandbox.assert.calledWith(collectionStub, collectionName);
    });
    it('should initiate any other collections', async () => {
        const collectionStub = sandbox.stub(service['scrabbleDb'], 'createCollection');
        const collectionName = Constants.DATABASE_COLLECTION_LOG;
        await service['initCollections'](collectionName);
        sandbox.assert.calledWith(collectionStub, collectionName);
    });
    it('should reset', async () => {
        sandbox.stub(service['scrabbleDb'], 'createCollection');
        const dropStub = sandbox.stub(service['scrabbleDb'], 'dropCollection');
        const collectionName = 'wtv';
        await service['reset'](collectionName);
        sandbox.assert.calledWith(dropStub, collectionName);
    });
    it('should run', async () => {
        sandbox.stub(service['scrabbleDb'], 'createCollection');
        sandbox.stub(service['client'], 'connect');
        sandbox.stub(service['scrabbleDb'], 'command');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        sandbox.stub(Collection.prototype, 'countDocuments').resolves(0);
        const closeStub = sandbox.stub(service['client'], 'close');
        closeStub.resolves(undefined);
        await service['run']();
        sandbox.assert.notCalled(closeStub);
    });
    it('should close connection if an error is caught', async () => {
        sandbox.stub(service['scrabbleDb'], 'createCollection');
        sandbox.stub(service['client'], 'connect').throws(new Error('error'));
        sandbox.stub(service['scrabbleDb'], 'command');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        sandbox.stub(Collection.prototype, 'countDocuments').resolves(0);
        const closeStub = sandbox.stub(service['client'], 'close');
        closeStub.resolves(undefined);
        try {
            await service['run']();
        } catch (err) {
            sandbox.assert.calledOnce(closeStub);
        }
    });
});
