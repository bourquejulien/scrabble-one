/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RackComponent } from '@app/components/rack/rack.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { FakePlayerService } from '@app/services/player/mock-player.service.spec';
import { PlayerService } from '@app/services/player/player.service';

fdescribe('RackComponent', () => {
    // let mockPlayerRack = ['a', 'b', 'c', 'd'];
    // let lettersToPlace = 'abc';
    let component: RackComponent;
    let fixture: ComponentFixture<RackComponent>;
    //const playerServiceSpy: PlayerService = jasmine.createSpyObj('PlayerService', ['updateRack'], ['rack']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RackComponent],
            //providers: [{ provide: PlayerService, useValue: playerServiceSpy }],
            providers: [{ provide: PlayerService, useClass: FakePlayerService }],

            imports: [AppMaterialModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {

        fixture = TestBed.createComponent(RackComponent);
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
        let points = component.retrievePoints('a');
        expect(points).toBe(1);

        points = component.retrievePoints('h');
        expect(points).toBe(4);

        points = component.retrievePoints('k');
        expect(points).toBe(10);
    });

    /*it('should update rack component if rack player modified', () => {
        playerServiceSpy['setRack'](mockPlayerRack);
        playerServiceSpy['updateRack'](lettersToPlace);

        const currentPlayerRack = playerServiceSpy['rack'];
        component.refreshRack();
        const refreshedComponentRack = component.rack;

        expect(refreshedComponentRack).toEqual(currentPlayerRack);

    });*/
});
