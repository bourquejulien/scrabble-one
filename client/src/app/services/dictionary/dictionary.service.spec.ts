import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { Dictionary } from '@app/classes/dictionary';
import { Constants } from '@app/constants/global.constants';

const DICTIONARY: Dictionary = { title: 'test', description: 'test', words: ['pomme', 'orange', 'poire', 'raisin', 'peche', 'banane', 'bananes'] };

describe('DictionaryService', () => {
    let service: DictionaryService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });

        service = TestBed.inject(DictionaryService);
        httpMock = TestBed.inject(HttpTestingController);

        const request = httpMock.expectOne(Constants.dictionary.DICTIONARY_PATH);
        expect(request.request.method).toBe('GET');
        request.flush(DICTIONARY);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should contain word', () => {
        expect(service.lookup('pomme')).toBe(true);
    });
});
