/* eslint-disable dot-notation,
@typescript-eslint/no-unused-expressions,
@typescript-eslint/no-empty-function,
no-unused-expressions,
*/
import { expect } from 'chai';
import { DatabaseService } from '@app/services/database/database.service';
import { assert, createSandbox, SinonSandbox, SinonStubbedInstance, stub } from 'sinon';
import { Collection, Db, FindCursor, InsertOneResult, ModifyResult, WithId } from 'mongodb';
import { DictionaryMetadata, VirtualPlayerLevel } from '@common';
import { AdminPersistence } from '@app/services/admin/admin-persistence';
const names = ['Éléanor', 'Alfred', 'Jeannine'];
describe('AdminPersistence', () => {
    let service: AdminPersistence;
    let dbServiceStub: SinonStubbedInstance<DatabaseService>;
    let sandbox: SinonSandbox;
    let collectionStub: SinonStubbedInstance<Collection>;
    let dbStub: SinonStubbedInstance<Db>;
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
        collectionStub.find.returns({
            toArray: () => {
                return names;
            },
        } as unknown as FindCursor);
        collectionStub.findOne.resolves({ _id: 'dictionary.json' } as unknown as WithId<DictionaryMetadata>);
        collectionStub.findOneAndDelete.resolves({ value: true } as unknown as ModifyResult);
        collectionStub.countDocuments.resolves(1);
        dbStub.collection.returns(collectionStub as unknown as Collection);
        service = new AdminPersistence(dbServiceStub as unknown as DatabaseService);
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should be created', () => {
        expect(service).to.be.ok;
    });
    it('should init', async () => {
        collectionStub.countDocuments.resolves(0);
        await service.init();
        assert.calledOnce(collectionStub.insertMany);
    });
    it('should reset', async () => {
        await service.reset();
        assert.calledOnce(dbStub.dropCollection);
    });
    it('should delete player', async () => {
        expect(await service.deleteVirtualPlayer('Monique')).to.equal(VirtualPlayerLevel.Easy);
    });
    it('should get metadata by id from database', async () => {
        await service.addVirtualPlayer(VirtualPlayerLevel.Easy, 'Éléanor');
        await service.addVirtualPlayer(VirtualPlayerLevel.Easy, 'Alfred');
        expect(await service.getPlayerNames()).to.equal(names);
    });
    it('should not add duplicates', async () => {
        try {
            collectionStub.insertOne.resolves(new Error(''));
        } catch (err) {
            expect(await service.addVirtualPlayer(VirtualPlayerLevel.Easy, 'Alfred')).to.be.false;
        }
    });
    it('should get metadata by id from database', async () => {
        expect(await service.renameVirtualPlayer('Alfred', 'Alfredo')).to.equal(VirtualPlayerLevel.Expert);
    });
    it('should not rename playername', async () => {
        collectionStub.findOne.resolves(null);
        expect(await service.renameVirtualPlayer('Alfred', 'Alfredo')).to.be.null;
    });
});
