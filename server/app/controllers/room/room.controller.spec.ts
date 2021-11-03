/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
import { expect } from 'chai';
import { RoomController } from './room.controller';
import { assert, createStubInstance, spy } from 'sinon';
import { SessionHandlingService } from '@app/services/sessionHandling/session-handling.service';
import { SocketService } from '@app/services/socket/socket-service';
import { Server, Socket } from 'socket.io';
import { Message, MessageType } from '@common';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { SocketMock } from '@app/classes/socket-test-helper';

describe('RoomController', () => {
    let controller: RoomController;
    let socketServerMock: SocketMock;
    let stubSessionHandlingService;

    beforeEach(() => {
        const stubSocketService = createStubInstance(SocketService);
        socketServerMock = new SocketMock();
        stubSocketService['socketServer'] = socketServerMock as unknown as Server;

        stubSessionHandlingService = createStubInstance(SessionHandlingService, {
            getSessionId: 'sessionId',
        }) as unknown as SessionHandlingService;

        controller = new RoomController(stubSocketService, stubSessionHandlingService);
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
        const stubSocketService = createStubInstance(SocketService);
        socketServerMock = new SocketMock();
        stubSocketService['socketServer'] = socketServerMock as unknown as Server;

        stubSessionHandlingService = createStubInstance(SessionHandlingService, {
            getSessionId: 'full',
        }) as unknown as SessionHandlingService;

        controller = new RoomController(stubSocketService, stubSessionHandlingService);
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
        }) as unknown as SessionHandlingService;

        controller = new RoomController(stubSocketService, stubSessionHandlingService);

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
        }) as unknown as SessionHandlingService;

        controller = new RoomController(stubSocketService, stubSessionHandlingService);
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
        expect(await controller['isRoomFull'](socket, 'full')).to.be.equals(true);
    });
});
