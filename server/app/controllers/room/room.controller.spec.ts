/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers,no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
import { SocketMock } from '@app/classes/helpers/socket-test-helper';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { PlayerHandler } from '@app/handlers/player-handler/player-handler';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { SessionStatsHandler } from '@app/handlers/stats-handlers/session-stats-handler/session-stats-handler';
import { GameService } from '@app/services/game/game.service';
import { SessionHandlingService } from '@app/services/session-handling/session-handling.service';
import { SocketService } from '@app/services/socket/socket-service';
import { GameMode, GameType, Message, MessageType } from '@common';
import { expect } from 'chai';
import { assert, createSandbox, createStubInstance, SinonFakeTimers, SinonStubbedInstance, spy, stub, useFakeTimers } from 'sinon';
import { Server, Socket } from 'socket.io';
import { RoomController } from './room.controller';

const IDS = {
    player: '123',
    socket: '123',
    session: '123',
};

class SocketStub {
    leaveCallCount: number = 0;
    id: string = '';

    leave(id: string) {
        this.leaveCallCount++;
    }
}

describe('RoomController', () => {
    let controller: RoomController;
    let socketServerMock: SocketMock;
    let stubSessionHandlingService: SinonStubbedInstance<SessionHandlingService>;
    let sessionHandler: SinonStubbedInstance<SessionHandler>;
    let gameService: SinonStubbedInstance<GameService>;
    let clock: SinonFakeTimers;

    before(() => {
        clock = useFakeTimers();
    });

    after(() => {
        clock.restore();
    });

    beforeEach(() => {
        const stubSocketService = createStubInstance(SocketService);
        socketServerMock = new SocketMock();
        stubSocketService['socketServer'] = socketServerMock as unknown as Server;

        sessionHandler = createStubInstance(SessionHandler, {});
        sessionHandler.sessionInfo = { id: IDS.session, gameType: GameType.Multiplayer, playTimeMs: 0 };
        sessionHandler.sessionData = { isActive: false, isStarted: false, timeLimitEpoch: 0 };

        stub(sessionHandler, 'players').get(() => []);

        stubSessionHandlingService = createStubInstance(SessionHandlingService, {
            getSessionId: 'sessionId',
            getHandlerByPlayerId: sessionHandler as unknown as SessionHandler,
        });

        gameService = createStubInstance(GameService);

        controller = new RoomController(
            stubSocketService,
            stubSessionHandlingService as unknown as SessionHandlingService,
            gameService as unknown as GameService,
        );
    });

    it('should be created', () => {
        expect(controller).to.be.ok;
    });

    it('should call emit when a message is received from user', () => {
        const message: Message = {
            title: 'Title',
            body: 'body',
            messageType: MessageType.Message,
            fromId: 'user1',
        };

        controller['socketIdToPlayerId'].set(IDS.socket, '');

        controller['handleSockets']();

        const clientSocket = new SocketMock();

        const toRoomSpy = spy(socketServerMock, 'to');
        const inRoomSpy = spy(socketServerMock, 'in');

        socketServerMock.triggerEndpoint('connection', clientSocket);
        clientSocket.triggerEndpoint('message', message);
        message.messageType = MessageType.System;
        clientSocket.triggerEndpoint('message', message);

        message.messageType = MessageType.RemoteMessage;
        clientSocket.triggerEndpoint('message', message);
        stubSessionHandlingService.getHandlerByPlayerId.returns(null);
        clientSocket.triggerEndpoint('message', message);

        const dummySessionHandler = {
            players: [{ id: '123' }, { id: '321' }],
        } as unknown as SessionHandler;
        stubSessionHandlingService.getHandlerByPlayerId.returns(dummySessionHandler);
        clientSocket.triggerEndpoint('message', message);

        assert.calledOnce(toRoomSpy);
        assert.calledThrice(inRoomSpy);
    });

    it('should log when receiving a disconnect message', async () => {
        controller['handleSockets']();
        const clientSocket = new SocketMock();
        controller['socketIdToPlayerId'].set('321', '321');
        socketServerMock.triggerEndpoint('connection', clientSocket);
        clientSocket.triggerEndpoint('disconnect');
        controller['handleSockets']();
        const clientSocket2 = new SocketMock();
        controller['socketIdToPlayerId'].set('123', '123');
        socketServerMock.triggerEndpoint('connection', clientSocket2);
        clientSocket.triggerEndpoint('disconnect');
        clock.tick(5000);
    });

    it('should send rooms', async () => {
        const stubSessionHandler = createStubInstance(SessionHandler) as unknown as SessionHandler;
        controller['handleSockets']();

        const clientSocket = new SocketMock();
        const emitSpy = spy(clientSocket, 'emit');

        stubSessionHandler['sessionInfo'] = {
            id: '',
            playTimeMs: 0,
            gameType: GameType.SinglePlayer,
        };
        stubSessionHandler['statsHandler'] = {
            gameMode: GameMode.Classic,
        } as unknown as SessionStatsHandler;
        stubSessionHandler['boardHandler'] = {
            isRandomBonus: false,
        } as BoardHandler;
        stubSessionHandler['playerHandler'] = {
            players: [{ playerInfo: { name: '' } }],
        } as PlayerHandler;

        stubSessionHandlingService.getSessionId.returns('');
        stubSessionHandlingService.getAvailableSessions.returns([stubSessionHandler as unknown as SessionHandler]);

        controller['sessionHandlingService']['sessionHandlers'] = [stubSessionHandler];

        await socketServerMock.triggerEndpoint('connection', clientSocket);
        await clientSocket.triggerEndpoint('getRooms');
        assert.called(emitSpy);
    });

    it('should join the correct rooms', async () => {
        const stubSessionHandler = createStubInstance(SessionHandler) as unknown as SessionHandler;
        stubSessionHandler['sessionInfo'] = {
            id: '',
            playTimeMs: 0,
            gameType: GameType.SinglePlayer,
        };
        stubSessionHandler['statsHandler'] = {
            gameMode: GameMode.Classic,
        } as unknown as SessionStatsHandler;
        stubSessionHandler['boardHandler'] = {
            isRandomBonus: false,
        } as BoardHandler;
        stubSessionHandler['playerHandler'] = {
            players: [{ playerInfo: { name: '' } }],
        } as PlayerHandler;

        controller['handleSockets']();

        const clientSocket = new SocketMock();

        controller['sessionHandlingService']['sessionHandlers'] = [stubSessionHandler];

        stubSessionHandlingService.getSessionId.returns('');
        stubSessionHandlingService.getAvailableSessions.returns([stubSessionHandler as unknown as SessionHandler]);

        await socketServerMock.triggerEndpoint('connection', clientSocket);
        await clientSocket.triggerEndpoint('joinRoom', 'sessionId');

        assert.called(stubSessionHandlingService.getHandlerByPlayerId);
    });

    it('should not join if no handler is found', async () => {
        controller['handleSockets']();
        const clientSocket = new SocketMock();
        stubSessionHandlingService.getHandlerByPlayerId.returns(null);
        await socketServerMock.triggerEndpoint('connection', clientSocket);
        await clientSocket.triggerEndpoint('joinRoom', 'full');
        // assert.called(stubSessionHandlingService.getHandlerByPlayerId);
    });

    it('should exit room', async () => {
        controller['handleSockets']();
        const stubSessionHandler = createStubInstance(SessionHandler) as unknown as SessionHandler;
        controller['sessionHandlingService']['sessionHandlers'] = [stubSessionHandler];
        const clientSocket = new SocketMock();
        controller['socketIdToPlayerId'].set('123', '123');
        socketServerMock.triggerEndpoint('connection', clientSocket);
        clientSocket.triggerEndpoint('exit', 'dummy param');
        assert.calledOnce(gameService.convertOrDispose);
    });

    it('should fail to exit room', async () => {
        controller['handleSockets']();
        const stubSessionHandler = createStubInstance(SessionHandler) as unknown as SessionHandler;
        controller['sessionHandlingService']['sessionHandlers'] = [stubSessionHandler];
        const clientSocket = new SocketMock();
        socketServerMock.triggerEndpoint('connection', clientSocket);
        clientSocket.triggerEndpoint('exit', 'dummy param');
        assert.notCalled(gameService.convertOrDispose);
    });

    // it('should not join if the room is full', async () => {
    //     // Sorry for the copy-paste: it is the simplest way to go to change the attributes of the stub once it was created
    //     const stubSocketService = createStubInstance(SocketService);
    //     socketServerMock = new SocketMock();
    //     stubSocketService['socketServer'] = socketServerMock as unknown as Server;
//
    //     stubSessionHandlingService = createStubInstance(SessionHandlingService, {
    //         getSessionId: 'full',
    //     });
    //     controller = new RoomController(
    //         stubSocketService,
    //         stubSessionHandlingService as unknown as SessionHandlingService,
    //         gameService as unknown as GameService,
    //     );
    //     // End of copy-paste
    //     const stubSessionHandler = createStubInstance(SessionHandler);
    //     stubSessionHandler['sessionInfo'] = {
    //         id: '',
    //         playTimeMs: 0,
    //         gameType: GameType.SinglePlayer,
    //     };
    //     stubSessionHandler['statsHandler'] = {
    //         gameMode: GameMode.Classic,
    //     } as unknown as SessionStatsHandler;
    //     stubSessionHandler['boardHandler'] = {
    //         isRandomBonus: false,
    //     } as BoardHandler;
    //     stubSessionHandler['playerHandler'] = {
    //         players: [{ playerInfo: { name: '' } }, { playerInfo: { name: '1' } }],
    //     } as PlayerHandler;
    //     stub(controller, 'sessionInfos' as any).get(() => {
    //         return { id: 'full', gameMode: GameMode.Classic, playTimeMs: 0, waitingPlayerName: 'test', isRandomBonus: false };
    //     });
    //     stubSessionHandler.sessionData = { isActive: true, isStarted: false, timeLimitEpoch: 0 };
    //     stubSessionHandlingService.getHandlerByPlayerId.returns(stubSessionHandler as unknown as SessionHandler);
    //     controller['handleSockets']();
    //     const clientSocket = new SocketMock();
    //     socketServerMock.triggerEndpoint('connection', clientSocket);
    //     const joinSpy = spy(clientSocket, 'join');
    //     await controller['onRoomJoined'](clientSocket as unknown as Socket, 'playerId');
    //     assert.notCalled(joinSpy);
    // });

    it('should join a room', async () => {
        // Sorry for the copy-paste: it is the simplest way to go to change the attributes of the stub once it was created
        const stubSocketService = createStubInstance(SocketService);
        socketServerMock = new SocketMock();
        stubSocketService['socketServer'] = socketServerMock as unknown as Server;

        stubSessionHandlingService = createStubInstance(SessionHandlingService, {
            getSessionId: 'sessionId',
        });

        controller = new RoomController(
            stubSocketService,
            stubSessionHandlingService as unknown as SessionHandlingService,
            gameService as unknown as GameService,
        );

        const stubSessionHandler = createStubInstance(SessionHandler) as unknown as SessionHandler;
        stubSessionHandler['sessionData'] = {
            isActive: true,
            isStarted: true,
            timeLimitEpoch: 123456789,
        };
        controller['sessionHandlingService']['sessionHandlers'] = [stubSessionHandler];
        // End of copy-paste

        controller['handleSockets']();

        const clientSocket = new SocketMock();
        const joinSpy = spy(clientSocket, 'join');
        socketServerMock.triggerEndpoint('connection', clientSocket);
        clientSocket.triggerEndpoint('joinRoom', 'playerId');
        assert.notCalled(joinSpy);
    });

    it('should not join a room if the playerId is not in it', async () => {
        // Sorry for the copy-paste: it is the simplest way to go to change the attributes of the stub once it was created
        const stubSocketService = createStubInstance(SocketService);
        socketServerMock = new SocketMock();
        stubSocketService['socketServer'] = socketServerMock as unknown as Server;

        stubSessionHandlingService = createStubInstance(SessionHandlingService, {
            getSessionId: '',
        });

        controller = new RoomController(
            stubSocketService,
            stubSessionHandlingService as unknown as SessionHandlingService,
            gameService as unknown as GameService,
        );
        // End of copy-paste

        controller['handleSockets']();

        const clientSocket = new SocketMock();
        const joinSpy = spy(clientSocket, 'join');
        socketServerMock.triggerEndpoint('connection', clientSocket);
        clientSocket.triggerEndpoint('joinRoom', 'playerId');
        assert.notCalled(joinSpy);
    });

    it('should tell when a room is full', async () => {
        const socket = new SocketMock() as unknown as Socket;
        expect(await RoomController['isRoomFull'](socket, 'full')).to.equal(true);
    });

    it('should stop correctly', async () => {
        const stubSessionHandler = createStubInstance(SessionHandler) as unknown as SessionHandler;
        stubSessionHandler['sessionInfo'] = {
            id: '',
            playTimeMs: 0,
            gameType: GameType.SinglePlayer,
        };
        stubSessionHandler['statsHandler'] = {
            gameMode: GameMode.Classic,
        } as unknown as SessionStatsHandler;
        stubSessionHandler['boardHandler'] = {
            isRandomBonus: false,
        } as BoardHandler;
        stubSessionHandler['playerHandler'] = {
            players: [{ playerInfo: { name: '' } }],
        } as PlayerHandler;

        stubSessionHandlingService.getSessionId.returns('');
        stubSessionHandlingService.getAvailableSessions.returns([stubSessionHandler as unknown as SessionHandler]);
        const playerId = 'id';
        const socket = new SocketStub();

        await controller['convertOrDispose'](socket as unknown as Socket, playerId);
        expect(socket.leaveCallCount).to.equal(2);
    });

    it('onRoomJoined should call start on session handler if game is not started', async () => {
        const playerId = 'id';
        const socket = new SocketMock();
        const stubSessionHandler = createStubInstance(SessionHandler);
        stubSessionHandler['sessionInfo'] = {
            id: '',
            playTimeMs: 0,
            gameType: GameType.SinglePlayer,
        };
        stubSessionHandler['statsHandler'] = {
            gameMode: GameMode.Classic,
        } as unknown as SessionStatsHandler;
        stubSessionHandler['boardHandler'] = {
            isRandomBonus: false,
        } as BoardHandler;
        stubSessionHandler['playerHandler'] = {
            players: [{ playerInfo: { name: '' } }],
        } as PlayerHandler;
        stub(controller, 'sessionInfos' as any).get(() => {
            return { id: '0', gameMode: GameMode.Classic, playTimeMs: 0, waitingPlayerName: 'test', isRandomBonus: false };
        });
        stubSessionHandler.sessionData = { isActive: true, isStarted: false, timeLimitEpoch: 0 };
        stubSessionHandlingService.getHandlerByPlayerId.returns(stubSessionHandler as unknown as SessionHandler);
        await controller['onRoomJoined'](socket as unknown as Socket, playerId);
        expect(stubSessionHandler.start.called).to.be.true;
    });

    it('onMessage supports that socketIdToPlayer didnt get', () => {
        createSandbox().stub(controller['socketIdToPlayerId'], 'get').returns(undefined);
        const message: Message = {
            title: 'Title',
            body: 'body',
            messageType: MessageType.Message,
            fromId: 'user1',
        };

        controller['socketIdToPlayerId'].set(IDS.socket, '');

        controller['handleSockets']();

        const clientSocket = new SocketMock();

        const toRoomSpy = spy(socketServerMock, 'to');
        const inRoomSpy = spy(socketServerMock, 'in');

        socketServerMock.triggerEndpoint('connection', clientSocket);
        clientSocket.triggerEndpoint('message', message);
        message.messageType = MessageType.System;
        clientSocket.triggerEndpoint('message', message);

        message.messageType = MessageType.RemoteMessage;
        clientSocket.triggerEndpoint('message', message);
        stubSessionHandlingService.getHandlerByPlayerId.returns(null);
        clientSocket.triggerEndpoint('message', message);

        const dummySessionHandler = {
            players: [{ id: '123' }, { id: '321' }],
        } as unknown as SessionHandler;
        stubSessionHandlingService.getHandlerByPlayerId.returns(dummySessionHandler);
        clientSocket.triggerEndpoint('message', message);

        assert.calledOnce(toRoomSpy);
        assert.calledThrice(inRoomSpy);
    });
});
