/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RoomListComponent } from './room-list.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RoomService } from '@app/services/room/room.service';
import { MatDialogRef } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { AppMaterialModule } from '@app/modules/material.module';
import { Subject } from 'rxjs';
import { AvailableGameConfig } from '@common';

const ROOMS = ['a', 'b', 'c'];

describe('RoomListComponent', () => {
    let component: RoomListComponent;
    let fixture: ComponentFixture<RoomListComponent>;
    let roomServiceSpy: jasmine.SpyObj<RoomService>;

    beforeEach(async () => {
        roomServiceSpy = jasmine.createSpyObj('RoomService', ['init', 'refresh', 'join'], {
            rooms: ROOMS,
            onAvailable: new Subject<AvailableGameConfig[]>().asObservable(),
        });
        await TestBed.configureTestingModule({
            declarations: [RoomListComponent],
            imports: [HttpClientTestingModule, AppMaterialModule, RouterTestingModule.withRoutes([{ path: 'game', component: GamePageComponent }])],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                { provide: RoomService, useValue: roomServiceSpy },
                { provide: MatDialogRef, useValue: {} },
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
});
