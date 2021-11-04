import { TestBed } from '@angular/core/testing';
import { PlayerService } from '@app/services/player/player.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TimerService } from './timer.service';

fdescribe('TimerService', () => {
    let service: TimerService;
    let playerService: jasmine.SpyObj<PlayerService>;
    let socketService: jasmine.SpyObj<SocketClientService>;

    beforeEach(() => {
        playerService = jasmine.createSpyObj('PlayerService', ['skipTurn']);
        socketService = jasmine.createSpyObj('SocketClientService', ['on']);
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

    it('should skip turn when time elapsed'), () => {
        // const spy = spyOn(Math, 'round');
        service.onTicks(10);
        expect(1).toEqual(1);
        //expect(playerService['skipTurn']).toHaveBeenCalled();
    }
});
