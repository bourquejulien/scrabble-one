/* eslint-disable dot-notation,
@typescript-eslint/no-unused-expressions,
@typescript-eslint/no-empty-function,
no-unused-expressions,
*/
import { DictionaryMetadata } from '@common';
import { expect } from 'chai';
import { DictionaryService } from './dictionary.service';
import mock from 'mock-fs';
import { DictionaryPersistence } from '@app/services/dictionary/dictionary-persistence';
import { assert, createStubInstance, SinonStubbedInstance } from 'sinon';
import { DictionaryHandler } from '@app/handlers/dictionary-handler/dictionary-handler';

describe('DictionaryService', () => {
    let service: DictionaryService;
    let dictionaryPersistenceStub: SinonStubbedInstance<DictionaryPersistence>;

    const notDictionary: DictionaryMetadata = {
        _id: 'not.json',
        path: 'assets/dictionaries/upload/not.json',
        description: 'Blablabla',
        title: 'My cool dictionary',
        nbWords: 1024,
    };

    const defaultDictionary: DictionaryMetadata = {
        _id: 'dictionary.json',
        path: 'assets/dictionaries/upload/dictionary.json',
        description: 'Default Dictionary',
        title: 'Dictionnaire du serveur',
        nbWords: 2048,
    };

    beforeEach(() => {
        dictionaryPersistenceStub = createStubInstance(DictionaryPersistence);
        dictionaryPersistenceStub.add.resolves(true);
        dictionaryPersistenceStub.defaultMetadata = defaultDictionary;
        service = new DictionaryService(dictionaryPersistenceStub as unknown as DictionaryPersistence);
        mock({
            'assets/dictionaries/upload': {
                'dictionary.json': '{"title":"Dico", "description":"French dictionary", "words":["alpha", "beta", "gamma"]}',
                'not.json': Buffer.from([1, 2, 3]),
            },
        });
    });

    afterEach(() => {
        mock.restore();
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('should be initiated', async () => {
        const handlersSize = service['handlers'].size;
        dictionaryPersistenceStub.defaultMetadata = {
            _id: 'dictionary.json',
            path: 'assets/dictionaries/upload/dictionary.json',
            description: 'Default Dictionary',
            title: 'Dictionnaire du serveur',
            nbWords: 2048,
        };
        await service.init();
        expect(handlersSize).to.equal(handlersSize + 1);
    });

    it('should parse correctly', async () => {
        const filepath = DictionaryService.getFilepath(defaultDictionary);
        expect((await service.add(filepath)).isSuccess).to.be.true;
    });

    it('should not parse invalid files', async () => {
        const filepath = DictionaryService.getFilepath(notDictionary);
        expect((await service.add(filepath)).isSuccess).to.be.false;
    });

    it('should not add duplicate', async () => {
        dictionaryPersistenceStub.add.resolves(false);
        const filepath = DictionaryService.getFilepath(defaultDictionary);
        expect((await service.add(filepath)).isSuccess).to.be.false;
    });

    it('should update', async () => {
        await service.update([defaultDictionary]);
        assert.calledOnce(dictionaryPersistenceStub.update);
    });

    it('should reset', async () => {
        await service.reset();
        assert.calledOnce(dictionaryPersistenceStub.reset);
    });

    it('should remove', async () => {
        dictionaryPersistenceStub.getMetadata.resolves([defaultDictionary]);
        dictionaryPersistenceStub.remove.resolves(defaultDictionary);
        expect(await service.remove('id')).to.be.true;
    });

    it('should not remove', async () => {
        dictionaryPersistenceStub.getMetadata.resolves(undefined);
        dictionaryPersistenceStub.remove.resolves(undefined);
        expect(await service.remove('id')).to.be.false;
    });

    it('should get handler', async () => {
        dictionaryPersistenceStub.getMetadataById.resolves(defaultDictionary);
        const handlerStub = createStubInstance(DictionaryHandler) as unknown as DictionaryHandler;
        service['handlers'].set('id', handlerStub);
        expect(await service.getHandler('id')).to.equal(handlerStub);
    });

    it('should not return handler', async () => {
        const originalPath = DictionaryService['dictionaryPath'];
        DictionaryService['dictionaryPath'] = 'assets/dictionary/upload';
        dictionaryPersistenceStub.getMetadataById.resolves(defaultDictionary);
        service['handlers'].clear();
        expect(await service.getHandler('id')).to.be.null;
        DictionaryService['dictionaryPath'] = originalPath;
    });

    it('should create handler', async () => {
        dictionaryPersistenceStub.getMetadataById.resolves(null);
        service['handlers'].clear();
        expect((await service.getHandler('id')).isSuccess).to.be.true;
    });

    it('should retrieve JSON', async () => {
        dictionaryPersistenceStub.getMetadataById.resolves(defaultDictionary);
        expect(await service.getJsonDictionary('id')).to.not.equal(defaultDictionary.nbWords);
    });

    it('should not reset', async () => {
        const originalPath = DictionaryService['dictionaryPath'];
        DictionaryService['dictionaryPath'] = 'not/a/valid/path';
        dictionaryPersistenceStub.reset.resolves();
        expect(await service.getJsonDictionary('id')).to.not.equal(defaultDictionary.nbWords);
        DictionaryService['dictionaryPath'] = originalPath;
    });

    it('should not get words', async () => {
        expect(await DictionaryService['getWords']('123456789')).to.deep.equal([]);
    });
});
