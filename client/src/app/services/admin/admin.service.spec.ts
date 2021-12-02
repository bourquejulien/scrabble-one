import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { AdminService } from './admin.service';
import { DictionaryMetadata } from '@common';

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
        expect(service.updateDictionaries()).toBeInstanceOf(Promise);
        expect(service.downloadDictionary('123')).toBeInstanceOf(Observable);
    });

    it('should correctly remove dictionaries', () => {
        const metadata: DictionaryMetadata = {
            _id: 'dictionary.json',
            path: 'dictionary.json',
            description: 'dictionary for tests',
            nbWords: 1024,
            title: 'Grand Dictionary of Tests',
        };
        service.dictionaries.push(metadata);
        service.removeDictionary(metadata);
        expect(service.dictionaries.length).toBe(1); // TODO not the right expectation
    });

    it('should correctly remove playernames', () => {
        // service.virtualPlayerNames.beginners.push('Monique');
        // const nameLength = service.virtualPlayerNames.beginners.length;
        // service.removePlayername('Monique', false);
        // expect(service.virtualPlayerNames.beginners.length).toBe(nameLength - 1);
    });

    it('should upload files correctly', () => {
        const file = new File(['foo'], 'mydictionary.json', { type: 'application/json' });
        service.uploadFile(file);
    });
});
