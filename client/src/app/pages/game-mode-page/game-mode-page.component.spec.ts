import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { cleanStyles } from '@app/classes/helpers/cleanup.helper';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameType } from '@common';
import { of } from 'rxjs';
import { GameModePageComponent } from './game-mode-page.component';
import { RouterTestingModule } from '@angular/router/testing';

@Component({
    selector: 'app-init-game',
    template: '',
})
class StubInitGameComponent {}

describe('GameModePageComponent', () => {
    let component: GameModePageComponent;
    let fixture: ComponentFixture<GameModePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameModePageComponent, StubInitGameComponent],
            imports: [AppMaterialModule, RouterTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameModePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open dialog window when new online game created', () => {
        const type = GameType.Multiplayer;
        const spy = spyOn(component.dialog, 'open').and.returnValue({
            afterClosed: () => of(true),
        } as MatDialogRef<typeof component>);
        component.openDialog(type);

        expect(spy).toHaveBeenCalled();
    });

    afterAll(() => cleanStyles());
});
