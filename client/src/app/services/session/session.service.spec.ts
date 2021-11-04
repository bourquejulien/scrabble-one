import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';


describe('SessionService', () => {
    let service: SessionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SessionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // it('should set config if pfovided', () => {
    //     let config = {
    //         id: '1',
    //         startId: '2',
    //         gameType: GameType.Multiplayer,
    //         playTimeMs: TimeSpan.fromMilliseconds(5),
    //         firstPlayerName: 'Ligma',
    //         secondPlayerName: 'Alphonse',
    //     }

    //     service.serverConfig(config);
    //     expect(service['_gameConfig']).toEqual(config);
    // })
});
