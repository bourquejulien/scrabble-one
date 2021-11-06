/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';

import { RoomService } from './room.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { GameService } from '@app/services/game/game.service';
import { GameType, MultiplayerCreateConfig, MultiplayerJoinConfig, ServerConfig } from '@common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

describe('RoomService', () => {
    let service: RoomService;
    let socketClientSpyObj: jasmine.SpyObj<SocketClientService>;
    let gameServiceSpyObj: jasmine.SpyObj<GameService>;
    let httpSpyObj: jasmine.SpyObj<HttpClient>;
    let serverConfigObservableSpyObj: jasmine.SpyObj<Observable<ServerConfig>>;

    beforeEach(() => {
        socketClientSpyObj = jasmine.createSpyObj(SocketClientService, ['on', 'send', 'reset', 'join']);

        gameServiceSpyObj = jasmine.createSpyObj(GameService, ['start']);
        serverConfigObservableSpyObj = jasmine.createSpyObj('Observable<ServerConfig>', ['toPromise']);
        httpSpyObj = jasmine.createSpyObj('HttpModule', ['get', 'put']);
        httpSpyObj.put.and.returnValue(serverConfigObservableSpyObj);

        TestBed.configureTestingModule({
            imports: [],
            providers: [
                { provide: HttpClient, useValue: httpSpyObj },
                { provide: SocketClientService, useValue: socketClientSpyObj },
                { provide: GameService, useValue: gameServiceSpyObj },
            ],
        });
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
        await service.join(config);
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
        expect(gameServiceSpyObj.start).toHaveBeenCalled();
        expect(service['pendingRoomId']).toBe('');
    });

    it('should handle turns', async () => {
        service['pendingRoomId'] = '';
        await service['onTurn']({} as unknown as ServerConfig);
        expect(socketClientSpyObj.reset).not.toHaveBeenCalled();

        service['pendingRoomId'] = 'pendingRoomId';
        await service['onTurn']({} as unknown as ServerConfig);
        expect(socketClientSpyObj.reset).toHaveBeenCalled();
        expect(service['pendingRoomId']).toBe('');
    });

    it('should create rooms', async () => {
        service['pendingRoomId'] = '';
        await service['create']({} as unknown as MultiplayerCreateConfig);
        expect(socketClientSpyObj.reset).not.toHaveBeenCalled();

        service['pendingRoomId'] = 'pendingRoomId';
        await service['create']({} as unknown as MultiplayerCreateConfig);
        expect(gameServiceSpyObj.start).toHaveBeenCalled();
        expect(service['pendingRoomId']).toBe('');
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
        await service['toSinglePlayer']();
        expect(socketClientSpyObj.reset).not.toHaveBeenCalled();

        service['pendingRoomId'] = 'pendingRoomId';
        await service['toSinglePlayer']();
        expect(gameServiceSpyObj.start).toHaveBeenCalled();
        expect(service['pendingRoomId']).toBe('');
    });

    it('should return observables', () => {
        expect(service.onGameFull).toBeInstanceOf(Observable);
        expect(service.onAvailable).toBeInstanceOf(Observable);
    });

    it('should send message when refresh is called', () => {
        service.refresh();
        expect(socketClientSpyObj.send).toHaveBeenCalledOnceWith('getRooms');
    });
});
