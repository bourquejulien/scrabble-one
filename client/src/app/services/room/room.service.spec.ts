/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameService } from '@app/services/game/game.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { GameType, MultiplayerJoinConfig, ServerConfig, VirtualPlayerLevel } from '@common';
import { Observable } from 'rxjs';
import { RoomService } from './room.service';
import { environmentExt } from '@environment-ext';

const localUrl = (base: string, call: string, id?: string) => `${environmentExt.apiUrl}${base}/${call}${id ? '/' + id : ''}`;

describe('RoomService', () => {
    let service: RoomService;
    let httpMock: HttpTestingController;
    let socketClientSpyObj: jasmine.SpyObj<SocketClientService>;
    let gameServiceSpyObj: jasmine.SpyObj<GameService>;
    let serverConfigObservableSpyObj: jasmine.SpyObj<Observable<ServerConfig>>;

    beforeEach(() => {
        socketClientSpyObj = jasmine.createSpyObj(SocketClientService, ['on', 'send', 'reset', 'join']);
        const callback = (event: string, action: (Param: any) => void) => {
            action({});
        };
        socketClientSpyObj.on.and.callFake(callback);
        gameServiceSpyObj = jasmine.createSpyObj(GameService, ['start']);
        serverConfigObservableSpyObj = jasmine.createSpyObj('Observable<ServerConfig>', ['toPromise']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: SocketClientService, useValue: socketClientSpyObj },
                { provide: GameService, useValue: gameServiceSpyObj },
            ],
        });

        httpMock = TestBed.inject(HttpTestingController);
        service = TestBed.inject(RoomService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should join correctly', async () => {
        const config: MultiplayerJoinConfig = {
            playerName: 'Claudette',
            sessionId: '1',
        };

        gameServiceSpyObj.start.and.callThrough();

        service.join(config).then(() => {
            expect(gameServiceSpyObj.start).toHaveBeenCalled();
        });

        const request = httpMock.expectOne(localUrl('game', 'join'));
        request.flush({
            id: '',
            startId: '',
            gameType: GameType.Multiplayer,
            playTimeMs: 0,
            firstPlayerName: '',
            secondPlayerName: '',
        });
    });

    it('should init correctly', async () => {
        service['pendingRoomId'] = 'abc';
        service.init();
        expect(service['pendingRoomId']).toBe('');
    });

    it('should abort', async () => {
        service['pendingRoomId'] = '';
        service['abort']();
        expect(gameServiceSpyObj.start).not.toHaveBeenCalled();

        service['pendingRoomId'] = 'pendingRoomId';
        service['abort']();
        expect(gameServiceSpyObj.start).not.toHaveBeenCalled();
        expect(service['pendingRoomId']).toBe('');
    });

    it('should handle turns', async () => {
        service['pendingRoomId'] = '';
        await service['onTurn']({} as unknown as ServerConfig);
        expect(socketClientSpyObj.reset).not.toHaveBeenCalled();

        service['pendingRoomId'] = 'pendingRoomId';
        await service['onTurn']({} as unknown as ServerConfig);
        expect(gameServiceSpyObj.start).toHaveBeenCalled();
    });

    it('should convert room to single player', async () => {
        const config = {
            gameType: GameType.SinglePlayer,
            playTimeMs: 1000,
            playerName: 'Monique',
            virtualPlayerName: 'Alphonse',
            isRandomBonus: false,
        };

        serverConfigObservableSpyObj.toPromise.and.resolveTo(config);

        service['pendingRoomId'] = '';
        await service['toSinglePlayer'](VirtualPlayerLevel.Easy);
        expect(socketClientSpyObj.reset).not.toHaveBeenCalled();

        service['pendingRoomId'] = 'pendingRoomId';
        service['toSinglePlayer'](VirtualPlayerLevel.Expert).then(() => {
            expect(gameServiceSpyObj.start).toHaveBeenCalled();
            expect(service['pendingRoomId']).toBe('');
        });

        const request = httpMock.expectOne(localUrl('game', 'convert'));
        request.flush({
            id: '',
            startId: '',
            gameType: GameType.Multiplayer,
            playTimeMs: 0,
            firstPlayerName: '',
            secondPlayerName: '',
        });
    });

    it('should return observables', () => {
        expect(service.onGameFull).toBeInstanceOf(Observable);
        expect(service.onAvailable).toBeInstanceOf(Observable);
    });

    it('should send message when refresh is called', () => {
        service.refresh();
        expect(socketClientSpyObj.send).toHaveBeenCalledOnceWith('getRooms');
    });

    it('should call roomSubject and onTurn when room is created', () => {
        expect(socketClientSpyObj['on']).toHaveBeenCalled();
    });
});
