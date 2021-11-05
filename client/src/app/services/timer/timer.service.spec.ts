/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation -- Need access to private functions and properties*/
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { TimeSpan } from '@app/classes/time/timespan';
import { PlayerService } from '@app/services/player/player.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TimerService } from './timer.service';

describe('TimerService', () => {
    let service: TimerService;
    let playerService: jasmine.SpyObj<PlayerService>;
    let socketService: jasmine.SpyObj<SocketClientService>;

    beforeEach(() => {
        playerService = jasmine.createSpyObj('PlayerService', ['skipTurn']);
        socketService = jasmine.createSpyObj('SocketClientService', ['on', 'reset']);
        const callback = (event: string, action: (Param: any) => void) => {
            action({});
        };
        socketService.on.and.callFake(callback);
        TestBed.configureTestingModule({
            providers: [
                { provide: SocketClientService, useValue: socketService },
                { provide: PlayerService, useValue: playerService },
            ],
        });
        service = TestBed.inject(TimerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call math round if onTicks called', () => {
        const spyRound = spyOn(Math, 'round');
        service['onTicks'](1);
        expect(spyRound).toHaveBeenCalled();
    });

    it('should call TimeSpan if onTicks called', () => {
        const spy = spyOn(TimeSpan, 'fromSeconds');
        service['onTicks'](1);
        expect(spy).toHaveBeenCalled();
    });

    it('should skip turn when time elapsed', () => {
        service['onTicks'](-5);
        expect(playerService['skipTurn'].and.callThrough()).toHaveBeenCalled();
    });

    it('should not skip turn when time not elapsed', () => {
        service['onTicks'](1);
        expect(playerService['skipTurn'].and.callThrough()).not.toHaveBeenCalled();
    });

    it('should call on timespan when timer created', () => {
        const spy = spyOn(TimeSpan, 'fromMilliseconds');
        new TimerService(socketService, playerService);
        expect(spy).toHaveBeenCalled();
    });

    it('should call on ticks when timer created', () => {
        // const spy = spyOn(service['socketService'], 'on');
        // const spy = spyOn<any>(service, 'onTicks');
        new TimerService(socketService, playerService);
        expect(socketService['on']).toHaveBeenCalled();
    });

    it('should return time', () => {
        service['timeSpan'] = TimeSpan.fromMinutesSeconds(1, 0);
        expect(service.time).toEqual(service['timeSpan']);
    });
});
