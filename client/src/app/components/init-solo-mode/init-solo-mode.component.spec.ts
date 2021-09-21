import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InitSoloModeComponent } from './init-solo-mode.component';

describe('InitSoloModeComponent', () => {
    let component: InitSoloModeComponent;
    let fixture: ComponentFixture<InitSoloModeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InitSoloModeComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InitSoloModeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
