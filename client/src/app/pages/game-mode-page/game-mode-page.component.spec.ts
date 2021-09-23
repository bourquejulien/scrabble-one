import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameModePageComponent } from './game-mode-page.component';

@Component({
    selector: 'app-init-solo-mode',
    template: '',
})
class StubInitSoloModeComponent {}

describe('GameModePageComponent', () => {
    let component: GameModePageComponent;
    let fixture: ComponentFixture<GameModePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameModePageComponent, StubInitSoloModeComponent],
            imports: [AppMaterialModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
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
});
