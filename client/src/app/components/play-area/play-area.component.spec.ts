/* eslint-disable max-classes-per-file -- Multiple stub implementation needed*/
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { Component, Injectable, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCard } from '@angular/material/card';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GridService } from '@app/services/grid/grid.service';

@Component({
    selector: 'app-rack',
    template: '',
})
class StubRackComponent {}

@Injectable({
    providedIn: 'root',
})
class GridServiceStub {
    // eslint-disable-next-line no-unused-vars -- Its a stub, implemented to do nothing
    drawGrid(canvas: CanvasRenderingContext2D): void {
        // Does nothing
    }

    // eslint-disable-next-line no-unused-vars -- Its a stub, implemented to do nothing
    drawSquares(canvas: CanvasRenderingContext2D): void {
        // Does nothing
    }
}

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent, StubRackComponent, MatCard],
            providers: [{ provide: GridService, useClass: GridServiceStub }],
            imports: [AppMaterialModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
