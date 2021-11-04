/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { LocationStrategy } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { SocketMock } from '@app/classes/socket-test-helper';
import { AppMaterialModule } from '@app/modules/material.module';
import { RoomService } from '@app/services/room/room.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Subject } from 'rxjs';
import { WaitingRoomPageComponent } from './waiting-room-page.component';

class MockLocationStrategy {
    callback: (...args: any) => {};
    onPopState(callback: (...args: any) => {}) {
        this.callback = callback;
    }
    trigger() {
        this.callback();
    }
}
describe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketClientService>;
    const socketClient: SocketMock = new SocketMock();
    let mockLocationStrategy: MockLocationStrategy;
    let routerSpy: jasmine.SpyObj<Router>;
    let roomServiceSpyObj: jasmine.SpyObj<RoomService>;

    beforeEach(async () => {
        mockLocationStrategy = new MockLocationStrategy();
        socketServiceSpyObj = jasmine.createSpyObj('SocketClientService', ['on'], { socketClient });
        roomServiceSpyObj = jasmine.createSpyObj('RoomService', ['toSinglePlayer', 'abort'], { onGameFull: new Subject<void>().asObservable() });
        routerSpy = jasmine.createSpyObj('Router', ['']);

        await TestBed.configureTestingModule({
            declarations: [WaitingRoomPageComponent],
            imports: [
                HttpClientTestingModule,
                AppMaterialModule,
                BrowserAnimationsModule,
                FormsModule,
            ],
            providers: [{ provide: SocketClientService, useValue: socketServiceSpyObj },
            { provide: LocationStrategy, useValue: mockLocationStrategy },
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

    it('should call abort and navigate back to settings page', async () => {
        const abortSpy = spyOn(component, 'abort');
        mockLocationStrategy.trigger();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['settings']);
        expect(abortSpy).toHaveBeenCalled();
    });

    it('should navigate to next page', async () => {
        component['nextPage']();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['game']);
    });

    it('should convert game type', async () => {
        component.convertToSoloMode();
        expect(roomServiceSpyObj['toSinglePlayer']).toHaveBeenCalled();
    });
});
