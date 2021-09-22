import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InitSoloModeComponent } from './init-solo-mode.component';

describe('InitSoloModeComponent', () => {
    let init: InitSoloModeComponent;
    let fixture: ComponentFixture<InitSoloModeComponent>;
    // const NAMES = ['Jean', 'RenÉéÎîÉéÇçÏï', 'moulon', 'Jo', 'Josiannnnnnnnnne', 'Jean123'];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InitSoloModeComponent],
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
