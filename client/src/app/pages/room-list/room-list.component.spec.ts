/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Injectable, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NameValidator } from '@app/classes/form-validation/name-validator';
import { AppMaterialModule } from '@app/modules/material.module';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { RoomService } from '@app/services/room/room.service';
import { AvailableGameConfig } from '@common';
import { Subject } from 'rxjs';
import { RoomListComponent } from './room-list.component';

const ROOMS = ['a', 'b', 'c'];
@Injectable({
    providedIn: 'root',
})
class MatDialogStub {
    subject = new Subject<any>();
    afterClosed() {
        return this.subject.asObservable();
    }
    close() {
        return;
    }
    open() {
        return;
    }
}
fdescribe('RoomListComponent', () => {
    let component: RoomListComponent;
    let fixture: ComponentFixture<RoomListComponent>;
    let roomServiceSpy: jasmine.SpyObj<RoomService>;
    let nameValidationSpy: jasmine.SpyObj<NameValidator>;
    let roomServiceSubject: Subject<AvailableGameConfig[]>;
    const playerName = 'Claudette';
    const RANDOM_RETURN_VALUE = 0.12;

    beforeEach(async () => {
        roomServiceSubject = new Subject<AvailableGameConfig[]>();
        roomServiceSpy = jasmine.createSpyObj('RoomService', ['init', 'refresh', 'join'], {
            rooms: ROOMS,
            onAvailable: roomServiceSubject.asObservable(),
        });
        nameValidationSpy = jasmine.createSpyObj('NameValidator', ['reset']);

        await TestBed.configureTestingModule({
            declarations: [RoomListComponent],
            imports: [
                HttpClientTestingModule,
                AppMaterialModule,
                RouterTestingModule.withRoutes([{ path: 'game', component: GamePageComponent }]),
                BrowserAnimationsModule,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                { provide: RoomService, useValue: roomServiceSpy },
                { provide: NameValidator, useValue: nameValidationSpy },
                { provide: MatDialogRef, useClass: MatDialogStub },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RoomListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('should call reset when a error dialog pops up', () => {
    //     const resetSpy = spyOn(component, 'reset');
    //     component['openErrorDialog']();
    //     expect(resetSpy).toHaveBeenCalled();
    // });

    // it('should call reset all values', () => {
    //     component['selectedConfig'] = { id: '1', isRandomBonus: true, playTimeMs: 1000, waitingPlayerName: 'playerName' };
    //     component['errorsList'].push('error');
    //     component.reset();
    //     expect(component['selectedConfig']).toBeNull();
    //     expect(component['errorsList'].length).toBe(0);
    //     expect(nameValidationSpy.reset).toHaveBeenCalled();
    // });

    it('should not join a random game if number of availableGame<=1', () => {
        component.availableGameConfigs.length = 1;
        component.randomJoin();
        expect(component.selectedConfig).toBe(null);
    });

    it('should join a random game if number of availableGame>=1', () => {
        spyOn(Math, 'random').and.returnValue(RANDOM_RETURN_VALUE);
        const availableConfigs: AvailableGameConfig[] = [
            { id: '1', isRandomBonus: true, playTimeMs: 1000, waitingPlayerName: playerName },
            { id: '2', isRandomBonus: true, playTimeMs: 1000, waitingPlayerName: 'Alphonse' },
        ];
        component.availableGameConfigs = availableConfigs;
        component.randomJoin();
        expect(component.selectedConfig?.id).toEqual(availableConfigs[0].id);
    });

    it('should join a new game if the correct info is provided', async () => {
        component.nameValidator.name = playerName;
        component['selectedConfig'] = null;
        component.join();
        component['selectedConfig'] = { id: '1', isRandomBonus: true, playTimeMs: 1000, waitingPlayerName: '' };
        component.join();

        component['selectedConfig'] = { id: '1', isRandomBonus: true, playTimeMs: 1000, waitingPlayerName: playerName };
        component.join();
    });

    it('should refresh configs', () => {
        component['selectedConfig'] = { id: '3', isRandomBonus: true, playTimeMs: 1000, waitingPlayerName: playerName };
        const availableConfigs: AvailableGameConfig[] = [
            { id: '1', isRandomBonus: true, playTimeMs: 1000, waitingPlayerName: playerName },
            { id: '2', isRandomBonus: true, playTimeMs: 1000, waitingPlayerName: 'Alphonse' },
        ];
        roomServiceSubject.next(availableConfigs);

        component['selectedConfig'] = null;
        roomServiceSubject.next(availableConfigs);
        // component.dialog.subject.next('something');
    });
});
