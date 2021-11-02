/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { WaitingRoomPageComponent } from './waiting-room-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SocketMock } from '@app/classes/socket-test-helper';

describe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketClientService>;
    const socketClient: SocketMock = new SocketMock();

    beforeEach(async () => {
        socketServiceSpyObj = jasmine.createSpyObj('SocketClientService', ['on'], { socketClient });
        await TestBed.configureTestingModule({
            declarations: [WaitingRoomPageComponent],
            imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([{ path: 'game', component: GamePageComponent }])],
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
});
