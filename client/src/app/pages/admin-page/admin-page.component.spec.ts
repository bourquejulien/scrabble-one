/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/semi */
/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { AppMaterialModule } from '@app/modules/material.module';
import { AdminService } from '@app/services/admin/admin.service';
import { Answer, DictionaryMetadata } from '@common';
import { Subject } from 'rxjs';

import { AdminPageComponent } from './admin-page.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/compiler';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const dictionary: DictionaryMetadata = {
    _id: 'dictionary.json',
    path: '',
    nbWords: 2048,
    description: 'cool dictionary',
    title: 'Dictionary',
};
class BlobMock {}
describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let adminServiceSpyObj: jasmine.SpyObj<AdminService>;
    let eventSpyObj: jasmine.SpyObj<Event>;
    let subject: Subject<Answer<string>>;

    beforeEach(async () => {
        subject = new Subject<Answer<string>>();
        const routerMock = {
            navigate: jasmine.createSpy('navigate'),
        };
        adminServiceSpyObj = jasmine.createSpyObj('AdminService', ['downloadDictionary', 'resetSettings', 'updateDictionaries'], {
            onNotify: subject.asObservable(),
        });
        eventSpyObj = jasmine.createSpyObj('Event', [''], { target: new EventTarget() });
        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent],
            imports: [AppMaterialModule, BrowserAnimationsModule, HttpClientTestingModule],
            providers: [
                { provide: HttpClient, useClass: HttpClient },
                { provide: AdminService, useValue: adminServiceSpyObj },
                { provide: Router, useValue: routerMock },
                { provide: Event, useValue: eventSpyObj },
                { provide: Blob, useClass: BlobMock },
                { provide: Window, useClass: jasmine.createSpyObj('Window', ['']) },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should download dictionary', () => {
        const blobSubject = new Subject<Blob>();
        adminServiceSpyObj.downloadDictionary.and.returnValue(blobSubject.asObservable());
        component.downloadDictionary(dictionary._id);
        blobSubject.next(new Blob(['{}'], { type: 'application/json' }));
        expect(adminServiceSpyObj.downloadDictionary).toHaveBeenCalled();
    });

    it('updateDictionaries should call on adminService', () => {
        component.updateDictionaries();
        expect(adminServiceSpyObj.updateDictionaries).toHaveBeenCalled();
    });

    // it('should select file selected', () => {
    //     component.onFileSelected(new Event(''));
    // });

    it('should reset', () => {
        adminServiceSpyObj.resetSettings.and.resolveTo();
        component.resetSettings();
        expect(adminServiceSpyObj.resetSettings).toHaveBeenCalled();
    });
    it('should not reset', () => {
        // adminServiceSpyObj.resetSettings.and.returnValue();
        component.resetSettings();
        expect(adminServiceSpyObj.resetSettings).toHaveBeenCalled();
    });
    it('ngOnInit should call notify', () => {
        const spyNotify = spyOn<any>(component, 'notify');
        component.ngOnInit();
        subject.next({ payload: 'value', isSuccess: true });
        expect(spyNotify).toHaveBeenCalled();
    });
});
