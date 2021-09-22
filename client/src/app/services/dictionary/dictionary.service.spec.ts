import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { JsonDictionary } from '@app/classes/dictionary/json-dictionary';
import { Constants } from '@app/constants/global.constants';

const WORDS = ['pomme', 'orange', 'poire', 'raisin', 'peche', 'banane', 'bananes'];
const DICTIONARY: JsonDictionary = { title: 'test', description: 'test', words: WORDS };

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
        for (const word of WORDS) {
            expect(service.lookup(word)).toBe(true);
        }
    });

    it('should contain the start of a word', () => {
        for (const word of WORDS) {
            expect(service.lookUpStart(word.substring(0, word.length - 3)).isOther).toBe(true);
        }
    });
});
