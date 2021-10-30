/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { SocketMock } from '@common';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { WaitingRoomPageComponent } from './waiting-room-page.component';

describe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketClientService>;
    const socketClient: SocketMock = new SocketMock();

    beforeEach(async () => {
        socketServiceSpyObj = jasmine.createSpyObj('SocketClientService', [], { socketClient });
        await TestBed.configureTestingModule({
            declarations: [WaitingRoomPageComponent],
            imports: [RouterTestingModule.withRoutes([{ path: 'game', component: GamePageComponent }])],
            providers: [{ provide: SocketClientService, useValue: socketServiceSpyObj }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update available rooms from server', () => {
        component.ngOnInit();
        const availableRooms = ['123'];
        socketClient.oppositeEndpointEmit('availableRooms', availableRooms);
        expect(component['availableRooms']).toBe(availableRooms);
    });

    it('should join room', () => {
        const spyEmit = spyOn(socketServiceSpyObj['socketClient'], 'emit');
        const roomId = 'roomId';
        component.join(roomId);
        expect(spyEmit).toHaveBeenCalledWith('joinRoom', roomId);
    });
});
