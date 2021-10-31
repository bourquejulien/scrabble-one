/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RoomListComponent } from './room-list.component';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { SocketMock } from '@common';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';

describe('RoomListComponent', () => {
    let component: RoomListComponent;
    let fixture: ComponentFixture<RoomListComponent>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketClientService>;
    const socketClient: SocketMock = new SocketMock();

    beforeEach(async () => {
        socketServiceSpyObj = jasmine.createSpyObj('SocketClientService', [], { socketClient });
        await TestBed.configureTestingModule({
            declarations: [RoomListComponent, MatCard, MatIcon, MatToolbar],
            imports: [RouterTestingModule.withRoutes([{ path: 'game', component: GamePageComponent }])],
            providers: [{ provide: SocketClientService, useValue: socketServiceSpyObj }],
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

    it('should update available rooms from server', () => {
        component.ngOnInit();
        const availableRooms: string[] = ['123', '456', '789'];
        socketClient.triggerEndpoint('availableRooms', availableRooms);
        expect(component['availableRooms']).toBe(availableRooms);
    });

    it('should join room', () => {
        const spyEmit = spyOn(socketServiceSpyObj['socketClient'], 'emit');
        const roomId = 'roomId';
        component.join(roomId);
        expect(spyEmit).toHaveBeenCalledWith('joinRoom', roomId);
    });
});
