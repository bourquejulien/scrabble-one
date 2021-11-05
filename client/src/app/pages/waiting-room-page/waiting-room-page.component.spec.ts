/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { SocketMock } from '@app/classes/helpers/socket-test-helper';
import { AppMaterialModule } from '@app/modules/material.module';
import { RoomService } from '@app/services/room/room.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Subject } from 'rxjs';
import { WaitingRoomPageComponent } from './waiting-room-page.component';

describe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketClientService>;
    const socketClient: SocketMock = new SocketMock();
    let routerSpy: jasmine.SpyObj<Router>;
    let roomServiceSpyObj: jasmine.SpyObj<RoomService>;

    beforeEach(async () => {
        socketServiceSpyObj = jasmine.createSpyObj('SocketClientService', ['on'], { socketClient });
        roomServiceSpyObj = jasmine.createSpyObj('RoomService', ['toSinglePlayer', 'abort'], { onGameFull: new Subject<void>().asObservable() });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        // locationStrategySpyObj = jasmine.createSpyObj('PathLocationStrategy', ['onPopState', 'getBaseHref']);

        await TestBed.configureTestingModule({
            declarations: [WaitingRoomPageComponent],
            imports: [HttpClientTestingModule, AppMaterialModule, BrowserAnimationsModule, FormsModule],
            providers: [
                { provide: SocketClientService, useValue: socketServiceSpyObj },
                // { provide: LocationStrategy, useValue: locationStrategySpyObj },
                { provide: Router, useValue: routerSpy },
                { provide: RoomService, useValue: roomServiceSpyObj },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        routerSpy.navigate.calls.reset();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('should abort and navigate back to settings page', async () => {
    //     // locationStrategySpyObj.onPopState.and.callFake((callback: (...args: any[]) => {}) => callback());
    //     routerSpy.navigate.and.callThrough();
    //     roomServiceSpyObj.abort.and.callThrough();
    //     component.abort();
    //     expect(routerSpy.navigate).toHaveBeenCalledWith(['settings']);
    //     expect(roomServiceSpyObj.abort).toHaveBeenCalled();
    // });

    it('should navigate to next page', async () => {
        component['nextPage']();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['game']);
    });

    it('should convert game type', async () => {
        component.convertToSoloMode();
        expect(roomServiceSpyObj['toSinglePlayer']).toHaveBeenCalled();
    });
});
