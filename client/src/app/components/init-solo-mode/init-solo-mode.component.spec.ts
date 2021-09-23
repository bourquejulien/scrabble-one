import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { AppMaterialModule } from '@app/modules/material.module';
import { InitSoloModeComponent } from './init-solo-mode.component';

describe('InitSoloModeComponent', () => {
    let init: InitSoloModeComponent;
    let fixture: ComponentFixture<InitSoloModeComponent>;
    // const NAMES = ['Jean', 'RenÉéÎîÉéÇçÏï', 'moulon', 'Jo', 'Josiannnnnnnnnne', 'Jean123'];

    const routerMock = {
        navigate: jasmine.createSpy('navigate'),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InitSoloModeComponent],
            imports: [AppMaterialModule, BrowserAnimationsModule, FormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [{ provide: Router, useValue: routerMock }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InitSoloModeComponent);
        init = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(init).toBeTruthy();
    });
    /*
    it('should initialize', () => {
        expect(init.confirmInitialization(NAMES[0])).toBeTrue();
    });
    it('should initialize', () => {
        expect(init.confirmInitialization(NAMES[1])).toBeTrue();
    });
    it('should not initialize', () => {
        expect(init.confirmInitialization(NAMES[2])).toBeFalse();
    });
    it('should not initialize', () => {
        expect(init.confirmInitialization(NAMES[3])).toBeFalse();
    });
    it('should not initialize', () => {
        expect(init.confirmInitialization(NAMES[4])).toBeFalse();
    });
    it('should not initialize', () => {
        expect(init.confirmInitialization(NAMES[5])).toBeFalse();
    });
    it('should not initialize', () => {
        expect(init.confirmInitialization(NAMES[6])).toBeFalse();
    });
    */
});
