/* eslint-disable dot-notation -- player is private and we need access for the test */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { cleanStyles } from '@app/classes/helpers/cleanup.helper';
import { RackComponent } from '@app/components/rack/rack.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { RackService } from '@app/services/rack/rack.service';

describe('RackComponent', () => {
    let component: RackComponent;
    let fixture: ComponentFixture<RackComponent>;
    let rackService: RackService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RackComponent],
            imports: [AppMaterialModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RackComponent);
        rackService = TestBed.inject(RackService);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return -1 if attempting to retrieve points of a letter not in reserve', () => {
        let points = component.retrievePoints('A');
        expect(points).toBe(-1);

        points = component.retrievePoints('3');
        expect(points).toBe(-1);

        points = component.retrievePoints('$');
        expect(points).toBe(-1);
    });

    it('should return letter points if letter exist in letterDefinitions', () => {
        const aPoints = 1;
        let points = component.retrievePoints('a');
        expect(points).toBe(aPoints);

        const hPoints = 4;
        points = component.retrievePoints('h');
        expect(points).toBe(hPoints);

        const kPoints = 10;
        points = component.retrievePoints('k');
        expect(points).toBe(kPoints);
    });

    it('should reset swap selection', () => {
        component.swapSelection = 1;
        component.reset();

        expect(component.swapSelection).toEqual(-1);
    });

    it('should set swap selection on click', () => {
        const POSITION = 5;
        component.onClick(POSITION);

        expect(component.swapSelection).toEqual(POSITION);
    });

    it('should not swap if no selection', () => {
        const spy = spyOn(rackService, 'swapRight');
        component.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

        expect(spy).not.toHaveBeenCalled();
    });

    it('should swap right', () => {
        const POSITION = 5;
        const spy = spyOn(rackService, 'swapRight');

        component.swapSelection = POSITION;
        component.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

        expect(spy).toHaveBeenCalledWith(POSITION);
    });

    it('should swap left', () => {
        const POSITION = 5;
        const spy = spyOn(rackService, 'swapLeft');

        component.swapSelection = POSITION;
        component.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

        expect(spy).toHaveBeenCalledWith(POSITION);
    });

    it('should initialise swapSelection on mouse wheel', () => {
        component.onMousewheel(new WheelEvent('', { deltaY: 0 }));

        expect(component.swapSelection).toEqual(0);
    });

    it('should change swapSelection on mouse wheel', () => {
        const POSITION = 5;
        const spy = spyOn(rackService, 'mod').and.returnValue(0);

        component.swapSelection = POSITION;
        component.onMousewheel(new WheelEvent('', { deltaY: 1 }));
        expect(spy).toHaveBeenCalledWith(POSITION - 1);
        expect(component.swapSelection).toEqual(0);

        spy.calls.reset();

        component.swapSelection = POSITION;
        component.onMousewheel(new WheelEvent('', { deltaY: -1 }));
        expect(spy).toHaveBeenCalledWith(POSITION + 1);
        expect(component.swapSelection).toEqual(0);
    });

    it('should handle key press', () => {
        const POSITION = 5;
        const LETTER = 'q';
        const spy = spyOn(rackService, 'indexOf').and.returnValue(POSITION);

        component.isFocus = true;

        component.onKeyDown(new KeyboardEvent('keydown', { key: LETTER }));

        expect(spy).toHaveBeenCalledWith(LETTER, 0);
        expect(component.swapSelection).toEqual(POSITION);
    });

    it('should reset if pressed key is not in rack', () => {
        const POSITION = 5;
        const LETTER = 'q';
        const spy = spyOn(rackService, 'indexOf').and.returnValue(-1);

        component.isFocus = true;
        component.swapSelection = POSITION;

        component.onKeyDown(new KeyboardEvent('keydown', { key: LETTER }));

        expect(spy).toHaveBeenCalledWith(LETTER, 0);
        expect(component.swapSelection).toEqual(-1);
    });

    afterAll(() => cleanStyles());
});
