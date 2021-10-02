/* eslint-disable dot-notation -- player is private and we need access for the test */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RackComponent } from '@app/components/rack/rack.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { PlayerService } from '@app/services/player/player.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

class PlayerServiceStub {
    rack: string[];
    rackUpdated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    setRack(mockRack: string[]): void {
        this.rack = [];

        for (const letter of mockRack) {
            this.rack.push(letter);
        }
    }

    get rackContent(): string[] {
        return this.rack;
    }
}

describe('RackComponent', () => {
    let component: RackComponent;
    let fixture: ComponentFixture<RackComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RackComponent],
            providers: [{ provide: PlayerService, useClass: PlayerServiceStub }],
            imports: [AppMaterialModule, HttpClientModule],
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
});
