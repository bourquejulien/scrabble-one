/* eslint-disable dot-notation */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { DictionaryMetadata, Failure, Success } from '@common';
import { Observable } from 'rxjs';
import { AdminService } from './admin.service';
import { environmentExt } from '@environment-ext';
import { HttpEventType } from '@angular/common/http';

const DEFAULT: DictionaryMetadata = {
    _id: 'dictionary.json',
    path: '',
    title: '',
    description: '',
    nbWords: 1,
};

const OTHER: DictionaryMetadata = {
    _id: 'dictionary2.json',
    path: '2',
    title: '2',
    description: '',
    nbWords: 1,
};

const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}admin/${call}/${id}`;

describe('AdminService', () => {
    let service: AdminService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(AdminService);
        httpMock = TestBed.inject(HttpTestingController);
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
        expect(service.dictionaries.length).toBe(1);
    });

    it('should check default dictionary', () => {
        expect(service.isDefaultDictionary(DEFAULT)).toBe(true);
    });

    it('should return default dictionary', () => {
        expect(service.defaultDictionary).toBe(null);
        service['dictionaries'].push(DEFAULT);
        expect(service.defaultDictionary).toBe(DEFAULT);
    });

    it('should remove dictionnary', fakeAsync(() => {
        service.dictionaries.push(OTHER);

        service.removeDictionary(OTHER);

        const request = httpMock.expectOne(localUrl('dictionary', OTHER._id));
        request.flush('');
        expect(service.dictionaries.length).toBe(0);
    }));

    it('should add to updated dictionaries', () => {
        expect(service['updatedDictionaries'].size).toBe(0);
        service.dictionaryUpdated(DEFAULT);
        expect(service['updatedDictionaries'].size).toBe(1);
    });

    it('should update success', () => {
        service['dictionaries'].push(OTHER);
        service.dictionaryUpdated(OTHER);

        service.onNotify.subscribe((ans) => {
            expect(ans.isSuccess).toBe(true);
        });

        service.updateDictionaries().then(() => {
            expect(service['dictionaries'].length).toBe(0);
        });

        const request = httpMock.expectOne(localUrl('dictionary', 'update'));
        const answer: Success<DictionaryMetadata[]> = { isSuccess: true, payload: [] };
        request.flush(answer);
    });

    it('should update fail', () => {
        service['dictionaries'].push(OTHER);
        service.dictionaryUpdated(OTHER);

        service.onNotify.subscribe((ans) => {
            expect(ans.isSuccess).toBe(false);
        });

        service.updateDictionaries().then(() => {
            expect(service['dictionaries'].length).toBe(0);
        });

        const request = httpMock.expectOne(localUrl('dictionary', 'update'));
        const answer: Failure<DictionaryMetadata[]> = { isSuccess: false, payload: [] };
        request.flush(answer);
    });

    it('Should sent success event on success server status', fakeAsync(() => {
        const file = new File(['foo'], 'mydictionary.json', { type: 'application/json' });
        service.uploadFile(file);

        service['dictionaries'].push(OTHER);
        service.dictionaryUpdated(OTHER);

        service.onNotify.subscribe((ans) => {
            expect(ans.isSuccess).toBe(true);
        });

        service.updateDictionaries().then(() => {
            expect(service['dictionaries'].length).toBe(0);
        });

        const request = httpMock.expectOne(localUrl('dictionary', 'upload'));
        const answer: Success<DictionaryMetadata[]> = { isSuccess: true, payload: [OTHER] };
        request.event({ type: HttpEventType.UploadProgress, loaded: 100, total: 90 });
        request.flush(answer);
    }));

    it('should sent fail event on fail server status', fakeAsync(() => {
        const file = new File(['foo'], 'mydictionary.json', { type: 'application/json' });
        service.uploadFile(file);

        service['dictionaries'].push(OTHER);
        service.dictionaryUpdated(OTHER);

        service.onNotify.subscribe((ans) => {
            expect(ans.isSuccess).toBe(false);
        });

        service.updateDictionaries().then(() => {
            expect(service['dictionaries'].length).toBe(0);
        });

        const request = httpMock.expectOne(localUrl('dictionary', 'upload'));
        const answer: Failure<DictionaryMetadata[]> = { isSuccess: false, payload: [] };
        request.event({ type: HttpEventType.UploadProgress, loaded: 100, total: 90 });
        request.event({ type: HttpEventType.UploadProgress, loaded: 100, total: undefined });

        request.flush(answer);
    }));

    it('should sent fail event on exception', fakeAsync(() => {
        const file = new File(['foo'], 'mydictionary.json', { type: 'application/json' });
        service.uploadFile(file);

        service['dictionaries'].push(OTHER);
        service.dictionaryUpdated(OTHER);

        service.onNotify.subscribe((ans) => {
            expect(ans.isSuccess).toBe(false);
        });

        service.updateDictionaries().then(() => {
            expect(service['dictionaries'].length).toBe(0);
        });

        const request = httpMock.expectOne(localUrl('dictionary', 'upload'));

        request.flush('', { status: 500, statusText: '' });
    }));

    it('should not sent fail event on exception under 400', fakeAsync(() => {
        const file = new File(['foo'], 'mydictionary.json', { type: 'application/json' });
        service.uploadFile(file);

        service['dictionaries'].push(OTHER);
        service.dictionaryUpdated(OTHER);

        let isCalled = false;

        service.onNotify.subscribe(() => {
            isCalled = true;
        });

        service.updateDictionaries().then(() => {
            expect(service['dictionaries'].length).toBe(0);
        });

        const request = httpMock.expectOne(localUrl('dictionary', 'upload'));

        request.flush('', { status: 300, statusText: '' });
        expect(isCalled).toBe(false);
    }));
});
