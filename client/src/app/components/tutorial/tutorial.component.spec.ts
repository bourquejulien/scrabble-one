import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TutorialComponent } from './tutorial.component';


describe('TutorialComponent', () => {
    let component: TutorialComponent;
    let fixture: ComponentFixture<TutorialComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TutorialComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TutorialComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
