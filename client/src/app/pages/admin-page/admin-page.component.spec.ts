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
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HealthService } from '@app/services/health/health.service';

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
    let healthServiceSpyyObj: jasmine.SpyObj<HealthService>;
    let eventSpyObj: jasmine.SpyObj<Event>;
    let subject: Subject<Answer<string>>;

    beforeEach(async () => {
        subject = new Subject<Answer<string>>();
        const routerMock = {
            navigate: jasmine.createSpy('navigate'),
        };
        adminServiceSpyObj = jasmine.createSpyObj('AdminService', ['downloadDictionary', 'resetSettings', 'updateDictionaries', 'uploadFile'], {
            onNotify: subject.asObservable(),
        });
        healthServiceSpyyObj = jasmine.createSpyObj('HealthService', ['isServerOk']);
        healthServiceSpyyObj.isServerOk.and.returnValue(Promise.reject());
        eventSpyObj = jasmine.createSpyObj('Event', [''], { target: new EventTarget() });
        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent],
            imports: [AppMaterialModule, BrowserAnimationsModule, HttpClientTestingModule],
            providers: [
                { provide: AdminService, useValue: adminServiceSpyObj },
                { provide: HealthService, useValue: healthServiceSpyyObj },
                { provide: Router, useValue: routerMock },
                { provide: Event, useValue: eventSpyObj },
                { provide: Blob, useClass: BlobMock },
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

    it('should select file selected', () => {
        const event = {
            target: { files: [{} as unknown as File] },
        };
        component.onFileSelected(event as unknown as Event);
        expect(adminServiceSpyObj.uploadFile).toHaveBeenCalled();
    });
    it('should not upload', () => {
        const event = {
            target: { files: null },
        };
        component.onFileSelected(event as unknown as Event);
        expect(adminServiceSpyObj.uploadFile).not.toHaveBeenCalled();
    });

    it('ngOnInit should call notify', () => {
        const spyNotify = spyOn<any>(component, 'notify');
        spyNotify.and.callThrough();
        component.ngOnInit();
        subject.next({ payload: 'value', isSuccess: true });
        expect(spyNotify).toHaveBeenCalled();
    });
});
