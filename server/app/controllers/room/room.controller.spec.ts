/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
import { expect } from 'chai';
import { RoomController } from './room.controller';
import { assert, createStubInstance, SinonFakeTimers, SinonStubbedInstance, spy, stub, useFakeTimers } from 'sinon';
import { SessionHandlingService } from '@app/services/sessionHandling/session-handling.service';
import { SocketService } from '@app/services/socket/socket-service';
import { GameType, Message, MessageType } from '@common';
import { GameService } from '@app/services/game/game.service';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { SocketMock } from '@app/classes/helpers/socket-test-helper';
import { Server, Socket } from 'socket.io';

const IDS = {
    player: '123',
    socket: '123',
    session: '123',
};

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

        stub(sessionHandler, 'players').get(() => []);

        stubSessionHandlingService = createStubInstance(SessionHandlingService, {
            getSessionId: 'sessionId',
            getHandlerByPlayerId: sessionHandler as unknown as SessionHandler,
        });

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

        controller['socketIdToPlayerId'].set(IDS.socket, IDS.player);

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
        //
        controller['handleSockets']();

        const clientSocket2 = new SocketMock();
        controller['socketIdToPlayerId'].set('123', '123');
        socketServerMock.triggerEndpoint('connection', clientSocket2);
        clientSocket.triggerEndpoint('disconnect');
        clock.tick(5000); // TODO: confirmation if fakeAsync is required
    });

    it('should send rooms', async () => {
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
        const stubSocketService = createStubInstance(SocketService);
        socketServerMock = new SocketMock();
        stubSocketService['socketServer'] = socketServerMock as unknown as Server;

        stubSessionHandlingService = createStubInstance(SessionHandlingService, {
            getSessionId: 'full',
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
        assert.notCalled(joinSpy); // TODO: won't be called since it is in a promise
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
        expect(await RoomController['isRoomFull'](socket, 'full')).to.be.equals(true);
    });

    it('should stop correctly', async () => {
        stubSessionHandlingService.getHandlerByPlayerId.returns(null);
        const playerId = 'id';
        controller['stop'](playerId);

        const handler = {
            sessionHandler: {
                gameType: GameType.Multiplayer,
            },
            sessionData: {
                isActive: true,
            },
            endGame: () => {},
            dispose: () => {},
        } as unknown as SessionHandler;
        stubSessionHandlingService.getHandlerByPlayerId.returns(handler);
        controller['stop'](playerId);
        clock.tick(6000);
    });
});
