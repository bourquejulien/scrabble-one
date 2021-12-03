/*
/!* eslint-disable dot-notation *!/
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from '@app/modules/material.module';
import { AdminService } from '@app/services/admin/admin.service';
import { DictionaryMetadata } from '@common';
import { Subject } from 'rxjs';

import { AdminPageComponent } from './admin-page.component';

const dictionary: DictionaryMetadata = {
    _id: 'dictionary.json',
    nbWords: 2048,
    description: 'cool dictionary',
    title: 'Dictionary',
};

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let adminServiceSpyObj: jasmine.SpyObj<AdminService>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent],
            imports: [AppMaterialModule, BrowserAnimationsModule],
            providers: [
                {
                    provide: AdminService,
                    useValue: adminServiceSpyObj,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        adminServiceSpyObj = jasmine.createSpyObj(AdminService, ['downloadDictionary', 'resetSettings', 'updateDictionaries'], {
            dictionaries: [],
            virtualPlayerNames: { beginners: [], experts: [] },
        });
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

    it('should select file selected', () => {
        component.onFileSelected(new Event('')); 

    it('should reset', () => {
        adminServiceSpyObj.resetSettings.and.returnValue(Promise.resolve());
        component.resetSettings();
        adminServiceSpyObj.resetSettings.and.returnValue(Promise.reject());
        component.resetSettings();
    });
});
*/
