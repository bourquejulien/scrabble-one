import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DictionaryMetadata } from '@common';
import { Observable } from 'rxjs';
import { AdminService } from './admin.service';

describe('AdminService', () => {
    let service: AdminService;
    // let httpMock: HttpTestingController;
    // const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}player/${call}/${id}`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(AdminService);
        // httpMock = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return asynchronous objects after requesting an URL', () => {
        expect(service.resetSettings()).toBeInstanceOf(Promise);
        expect(service.updatePlayerName()).toBeInstanceOf(Promise);
        expect(service.updateDictionaries()).toBeInstanceOf(Promise);
        expect(service.updatePlayerName()).toBeInstanceOf(Promise);
        expect(service.downloadDictionary('123')).toBeInstanceOf(Observable);
    });

    it('should correctly remove items', () => {
        const metadata: DictionaryMetadata = {
            _id: 'dictionary.json',
            description: 'dictionary for tests',
            nbWords: 1024,
            title: 'Grand Dictionary of Tests',
        };
        const nameLength = service.virtualPlayerNames.easy.length;
        service.removePlayerName('Monique', false);
        expect(service.virtualPlayerNames.easy.length).toBe(nameLength - 1);
        const dictionaryNb = service.dictionaries.length;
        service.removeDictionary(metadata);
        expect(service.dictionaries.length).toBe(dictionaryNb - 1);
    });

    it('should upload files correctly', () => {
        const file = new File(['foo'], 'mydictionary.json', { type: 'application/json' });
        service.uploadFile(file);
    });
});
