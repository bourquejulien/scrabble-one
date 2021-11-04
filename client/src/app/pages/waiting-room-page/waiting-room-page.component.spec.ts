/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { LocationStrategy } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketMock } from '@app/classes/socket-test-helper';
import { AppMaterialModule } from '@app/modules/material.module';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
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
    let routerSpy = { navigate: jasmine.createSpy('navigate') };
    beforeEach(async () => {
        mockLocationStrategy = new MockLocationStrategy();
        socketServiceSpyObj = jasmine.createSpyObj('SocketClientService', ['on'], { socketClient });

        await TestBed.configureTestingModule({
            declarations: [WaitingRoomPageComponent],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([{ path: 'game', component: GamePageComponent }]),
                AppMaterialModule,
                BrowserAnimationsModule,
                FormsModule,
            ],
            providers: [{ provide: SocketClientService, useValue: socketServiceSpyObj },
            { provide: LocationStrategy, useValue: mockLocationStrategy },
            { provide: Router, useValue: routerSpy }
            ],
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

    it('should call abort', () => {
        const abortSpy = spyOn(component, 'abort');
        mockLocationStrategy.trigger();
        expect(abortSpy).toHaveBeenCalled();
    });

    it('should navigate to next page', async () => {
        component['nextPage']();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['game']);
    });
});
