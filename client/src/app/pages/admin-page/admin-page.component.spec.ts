/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/semi */
/* eslint-disable dot-notation */
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { AppMaterialModule } from '@app/modules/material.module';
import { AdminService } from '@app/services/admin/admin.service';
import { Answer, DictionaryMetadata } from '@common';
import { Observable, Subject } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';


const dictionary: DictionaryMetadata = {
    _id: 'dictionary.json',
    path: '',
    nbWords: 2048,
    description: 'cool dictionary',
    title: 'Dictionary',
};

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let adminServiceSpyObj: jasmine.SpyObj<AdminService>;
    let eventSpyObj: jasmine.SpyObj<Event>;

    beforeEach(async () => {
        const routerMock = {
            navigate: jasmine.createSpy('navigate').and.callThrough(),
        };
        adminServiceSpyObj = jasmine.createSpyObj('AdminService', ['downloadDictionary', 'resetSettings', 'updateDictionaries'], {
            onNotify: new Observable<Answer<string>>(),
        });
        eventSpyObj = jasmine.createSpyObj('Event', [], { target: new EventTarget() });
        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent],

            imports: [AppMaterialModule, BrowserAnimationsModule],
            providers: [
                { provide: HttpClient, useClass: HttpClient },
                { provide: AdminService, useValue: adminServiceSpyObj },
                { provide: Router, useValue: routerMock },
                { provide: Event, useValue: eventSpyObj },
                HttpHandler,
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
        const subject = new Subject<Blob>();
        adminServiceSpyObj.downloadDictionary.and.returnValue(subject.asObservable());
        component.downloadDictionary(dictionary._id);
        subject.next(new Blob(['{}'], { type: 'application/json' }));
    });

    it('should download dictionary', () => {
        // adminServiceSpyObj.
    });

    it('updateDictionaries should call on adminService', () => {
        component.updateDictionaries();
        expect(adminServiceSpyObj.updateDictionaries).toHaveBeenCalled();
    });

    it('should select file selected', () => {
        component.onFileSelected(new Event(''));
    });

    // it('should reset', () => {
    //     const spyA = adminServiceSpyObj.resetSettings.and.returnValue(Promise.resolve());
    //     component.resetSettings();
    //     expect(spyA).toHaveBeenCalled();
    //     const spyB = adminServiceSpyObj.resetSettings.and.returnValue(Promise.reject());
    //     component.resetSettings();
    //     expect(spyB).toHaveBeenCalled();
    // });

    it('ngOnInit should call notify', () => {
        const spyNotify = spyOn<any>(component, 'notify');
        const message = new Subject<Answer<string>>();
        adminServiceSpyObj = jasmine.createSpyObj('AdminService', ['downloadDictionary', 'resetSettings', 'updateDictionaries'], {
            onNotify: message.asObservable(),
        });
        component.ngOnInit();
        expect(spyNotify).toHaveBeenCalled();
    });
});
