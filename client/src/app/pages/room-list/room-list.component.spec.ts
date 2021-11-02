/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RoomListComponent } from './room-list.component';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RoomService } from '@app/services/room/room.service';
import { MatList } from '@angular/material/list';

const ROOMS = ['a', 'b', 'c'];

describe('RoomListComponent', () => {
    let component: RoomListComponent;
    let fixture: ComponentFixture<RoomListComponent>;
    let roomServiceSpy: jasmine.SpyObj<RoomService>;

    beforeEach(async () => {
        roomServiceSpy = jasmine.createSpyObj('RoomService', ['init', 'refresh', 'join'], { rooms: ROOMS });
        await TestBed.configureTestingModule({
            declarations: [RoomListComponent, MatCard, MatIcon, MatToolbar, MatList],
            imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([{ path: 'game', component: GamePageComponent }])],
            providers: [{ provide: RoomService, useValue: roomServiceSpy }],
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

    it('should join room', () => {
        const roomId = 'roomId';
        component.join(roomId);
        expect(roomServiceSpy['join']).toHaveBeenCalledWith(roomId);
    });
});
