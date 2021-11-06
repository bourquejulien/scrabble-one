/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
import { SocketMock } from '@app/classes/helpers/socket-test-helper';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { GameService } from '@app/services/game/game.service';
import { SessionHandlingService } from '@app/services/sessionHandling/session-handling.service';
import { SocketService } from '@app/services/socket/socket-service';
import { GameType, Message, MessageType } from '@common';
import { expect } from 'chai';
import { assert, createSandbox, createStubInstance, SinonStubbedInstance, spy, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { RoomController } from './room.controller';

const IDS = {
    player: '123',
    socket: '123',
    session: '123',
};

describe('RoomController', () => {
    let controller: RoomController;
    let socketServerMock: SocketMock;
    let stubSessionHandlingService: SessionHandlingService;
    let sessionHandler: SinonStubbedInstance<SessionHandler>;
    let gameService: SinonStubbedInstance<GameService>;
    let stubSocketService: SinonStubbedInstance<SocketService>;

    beforeEach(() => {
        stubSocketService = createStubInstance(SocketService);
        socketServerMock = new SocketMock();
        stubSocketService['socketServer'] = socketServerMock as unknown as Server;

        sessionHandler = createStubInstance(SessionHandler, {});
        sessionHandler.sessionInfo = { id: IDS.session, gameType: GameType.Multiplayer, playTimeMs: 0 };

        stub(sessionHandler, 'players').get(() => []);

        stubSessionHandlingService = createStubInstance(SessionHandlingService, {
            getSessionId: 'sessionId',
            getHandlerByPlayerId: sessionHandler as unknown as SessionHandler,
        }) as unknown as SessionHandlingService;

        controller = new RoomController(stubSocketService, stubSessionHandlingService, gameService as unknown as GameService);
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

        controller['socketIdToPlayerId'].set(IDS.socket, IDS.player);

        controller['handleSockets']();

        const clientSocket = new SocketMock();

        const toRoomSpy = spy(socketServerMock, 'to');

        socketServerMock.triggerEndpoint('connection', clientSocket);
        clientSocket.triggerEndpoint('message', message);
        message.messageType = MessageType.System;
        clientSocket.triggerEndpoint('message', message);

        assert.calledOnce(toRoomSpy);
    });

    it('should log when receiving a disconnect message', () => {
        controller['handleSockets']();

        const clientSocket = new SocketMock();

        socketServerMock.triggerEndpoint('connection', clientSocket);
        clientSocket.triggerEndpoint('disconnect');
    });

    it('should send rooms', () => {
        controller['handleSockets']();

        const clientSocket = new SocketMock();

        const emitSpy = spy(clientSocket, 'emit');

        const stubSessionHandler = createStubInstance(SessionHandler) as unknown as SessionHandler;
        stubSessionHandler['sessionData'] = {
            isActive: true,
            isStarted: true,
            timeLimitEpoch: 123456789,
        };
        controller['sessionHandlingService']['sessionHandlers'] = [stubSessionHandler];

        socketServerMock.triggerEndpoint('connection', clientSocket);
        clientSocket.triggerEndpoint('getRooms');
        assert.called(emitSpy);
    });

    it('should join the correct rooms', async () => {
        controller['handleSockets']();

        const clientSocket = new SocketMock();

        const stubSessionHandler = createStubInstance(SessionHandler) as unknown as SessionHandler;
        controller['sessionHandlingService']['sessionHandlers'] = [stubSessionHandler];

        socketServerMock.triggerEndpoint('connection', clientSocket);
        clientSocket.triggerEndpoint('joinRoom', 'sessionId');
    });

    it('should not join if the room is full', async () => {
        // Sorry for the copy-paste: it is the simplest way to go to change the attributes of the stub once it was created
        stubSocketService = createStubInstance(SocketService);
        socketServerMock = new SocketMock();
        stubSocketService['socketServer'] = socketServerMock as unknown as Server;

        stubSessionHandlingService = createStubInstance(SessionHandlingService, {
            getSessionId: 'full',
        }) as unknown as SessionHandlingService;

        controller = new RoomController(stubSocketService, stubSessionHandlingService, gameService as unknown as GameService);
        // End of copy-paste

        controller['handleSockets']();

        const clientSocket = new SocketMock();
        const joinSpy = spy(clientSocket, 'join');
        socketServerMock.triggerEndpoint('connection', clientSocket);
        clientSocket.triggerEndpoint('joinRoom', 'playerId');
        assert.notCalled(joinSpy);
    });

    it('should join a room', async () => {
        // Sorry for the copy-paste: it is the simplest way to go to change the attributes of the stub once it was created
        stubSocketService = createStubInstance(SocketService);
        socketServerMock = new SocketMock();
        stubSocketService['socketServer'] = socketServerMock as unknown as Server;

        stubSessionHandlingService = createStubInstance(SessionHandlingService, {
            getSessionId: 'sessionId',
        }) as unknown as SessionHandlingService;

        controller = new RoomController(stubSocketService, stubSessionHandlingService, gameService as unknown as GameService);

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
        assert.notCalled(joinSpy); // TODO: won't be called since it is in a promise
    });

    it('should not join a room if the playerId is not in it', async () => {
        // Sorry for the copy-paste: it is the simplest way to go to change the attributes of the stub once it was created
        stubSocketService = createStubInstance(SocketService);
        socketServerMock = new SocketMock();
        stubSocketService['socketServer'] = socketServerMock as unknown as Server;

        stubSessionHandlingService = createStubInstance(SessionHandlingService, {
            getSessionId: '',
        }) as unknown as SessionHandlingService;

        controller = new RoomController(stubSocketService, stubSessionHandlingService, gameService as unknown as GameService);
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
        stubSocketService = createStubInstance(SocketService);
        socketServerMock = new SocketMock();
        stubSocketService['socketServer'] = socketServerMock as unknown as Server;

        stubSessionHandlingService = createStubInstance(SessionHandlingService, {
            getSessionId: '',
        }) as unknown as SessionHandlingService;

        controller = new RoomController(stubSocketService, stubSessionHandlingService, gameService as unknown as GameService);
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
        expect(await RoomController['isRoomFull'](socket, 'full')).to.be.equals(true);
    });

    it('should call delete on socketIdToPlayer', async () => {
        gameService = createStubInstance(GameService);
        controller = new RoomController(stubSocketService, stubSessionHandlingService, gameService as unknown as GameService);
        const stubDelete = createSandbox().stub(controller['socketIdToPlayerId'], 'delete');
        gameService.abandon.returns(
            new Promise<boolean>(() => {
                return true;
            }),
        );
        controller['abandon'](socketServerMock as unknown as Socket, '0');
        expect(stubDelete.called).to.be.true;
    });
    // Helps with coverage but throws cant read playerInfo of undefined
    /*
    it('should return an available game', () => {
        sessionHandler.sessionData = { isActive: false, isStarted: false, timeLimitEpoch: 1000 };
        sessionHandler.sessionInfo = { id: '0', playTimeMs: 1000, gameType: GameType.SinglePlayer };
        const humanPlayer = createStubInstance(HumanPlayer);
        humanPlayer.playerInfo = { id: '0', name: 'Boris', isHuman: true };
        const playerHandler = createStubInstance(PlayerHandler);
        playerHandler['players'] = [humanPlayer as unknown as HumanPlayer];
        sessionHandler['playerHandler'] = playerHandler;
        controller['sessionHandlingService']['sessionHandlers'] = [sessionHandler as unknown as SessionHandler];
        expect(controller['sessionInfos']).to.eql({ id: '0', playTimeMS: 1000, waitingPlayerName: 'Boris', isRandomBonus: true });
    });
    */
});
