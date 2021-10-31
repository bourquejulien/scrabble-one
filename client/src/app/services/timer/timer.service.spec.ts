import { TestBed } from '@angular/core/testing';
import { TimerService } from './timer.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { PlayerService } from '@app/services/player/player.service';
import createSpyObj = jasmine.createSpyObj;

describe('TimerService', () => {
    let service: TimerService;
    let playerService: PlayerService;
    let socketService: SocketClientService;

    beforeEach(() => {
        playerService = createSpyObj(PlayerService, ['skipTurn']);
        socketService = createSpyObj(SocketClientService, ['on']);
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
});
