/* eslint-disable dot-notation,
@typescript-eslint/no-unused-expressions,
@typescript-eslint/no-empty-function,
no-unused-expressions,
*/
import { expect } from 'chai';
import { DatabaseService } from '@app/services/database/database.service';
import { assert, createSandbox, SinonSandbox, SinonStubbedInstance, stub } from 'sinon';
import { Collection, Db, FindCursor, InsertOneResult, ModifyResult, WithId } from 'mongodb';
import { DictionaryPersistence } from '@app/services/dictionary/dictionary-persistence';
import { DictionaryMetadata } from '@common';
import path from 'path';

const metadata: DictionaryMetadata = {
    _id: 'some.json',
    path: 'assets/dictionaries/some.json',
    description: ' Dictionary',
    title: 'Dictionnaire',
    nbWords: 402503,
};

class Mock {
    limit() {
        return this;
    }
    toArray() {
        return [metadata];
    }
    sort() {
        return this;
    }
}
describe('DictionaryPersistence', () => {
    let service: DictionaryPersistence;
    let dbServiceStub: SinonStubbedInstance<DatabaseService>;
    let sandbox: SinonSandbox;
    let collectionStub: SinonStubbedInstance<Collection>;
    let dbStub: SinonStubbedInstance<Db>;
    const DEFAULT_PATH = path.join(process.cwd(), 'assets', 'dictionaries', 'dictionary.json');
    const defaultMetadata: DictionaryMetadata = {
        _id: 'dictionary.json',
        path: DEFAULT_PATH,
        description: 'Le dictionnaire par défaut',
        title: 'Dictionnaire du serveur',
        nbWords: 402503,
    };
    beforeEach(() => {
        sandbox = createSandbox();
        dbServiceStub = sandbox.createStubInstance(DatabaseService);
        dbStub = sandbox.createStubInstance(Db);
        stub(dbServiceStub, 'database').get(() => {
            return dbStub as unknown as Db;
        });
        collectionStub = sandbox.createStubInstance(Collection);
        collectionStub.insertOne.resolves({ acknowledged: true } as unknown as InsertOneResult);
        collectionStub.insertMany.resolves();
        collectionStub.deleteOne.resolves();
        collectionStub.find.returns(new Mock() as unknown as FindCursor);
        collectionStub.findOneAndDelete.resolves({ value: true } as unknown as ModifyResult);
        collectionStub.countDocuments.resolves(1);
        dbStub.collection.returns(collectionStub as unknown as Collection);
        service = new DictionaryPersistence(dbServiceStub as unknown as DatabaseService);
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should be created', () => {
        expect(service).to.be.ok;
    });
    it('should not add duplicates', async () => {
        collectionStub.findOne.resolves({ _id: 'dictionary.json' } as unknown as WithId<DictionaryMetadata>);
        expect(await service.add(defaultMetadata)).to.be.false;
    });
    it('should not add if there is a database error', async () => {
        collectionStub.insertOne.resolves({ acknowledged: false } as unknown as InsertOneResult);
        expect(await service.add(metadata)).to.be.false;
    });
    it('should add', async () => {
        expect(await service.add(metadata)).to.be.true;
    });
    it('should reset', async () => {
        await service.reset();
        assert.calledOnce(collectionStub.drop);
        expect(service['metaDataCache'].size).to.equal(1);
    });
    it('should get metadata by id from cache', async () => {
        service['metaDataCache'].set(defaultMetadata._id, defaultMetadata);
        expect(await service.getMetadataById(defaultMetadata._id)).to.equal(defaultMetadata);
    });
    it('should get metadata by id from database', async () => {
        expect(await service.getMetadataById(defaultMetadata._id)).to.deep.equal(defaultMetadata);
    });
    it('should get metadata', async () => {
        service['metaDataCache'].clear();
        expect((await service.getMetadata()).length).to.equal(1);
    });
    it('should remove', async () => {
        const initialSize = service['metaDataCache'].size;
        service['metaDataCache'].set('id', {} as unknown as DictionaryMetadata);
        await service.remove('id');
        assert.calledOnce(collectionStub.findOneAndDelete);
        expect(service['metaDataCache'].size).to.equal(initialSize);
    });
    it('should not remove', async () => {
        expect(await service.remove(defaultMetadata._id)).to.be.null;
    });
    it('should update', async () => {
        collectionStub.findOneAndUpdate.resolves({ value: true } as unknown as ModifyResult);
        await service.update(metadata);
        assert.calledOnce(collectionStub.findOneAndUpdate);
    });
    it('should not update', async () => {
        collectionStub.findOne.resolves({ _id: 'dictionary.json' } as unknown as WithId<DictionaryMetadata>);
        collectionStub.findOneAndUpdate.resolves({ value: null } as unknown as ModifyResult);
        expect(await service.update(metadata)).to.be.false;
        assert.notCalled(collectionStub.findOneAndUpdate);
    });
    it('should not update if there is a database error', async () => {
        collectionStub.findOneAndUpdate.resolves({ acknowledged: false } as unknown as InsertOneResult);
        expect(await service.update(metadata)).to.be.false;
    });
});
