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
import { Message, MessageType, SocketMock } from '@common';

describe('RoomController', () => {
    let roomController: RoomController;
    let socketServerMock: SocketMock;

    beforeEach(() => {
        const stubSocketService = createStubInstance(SocketService);
        socketServerMock = new SocketMock();
        stubSocketService['socketServer'] = socketServerMock as unknown as Server;

        const stubSessionHandlingService = createStubInstance(SessionHandlingService) as unknown as SessionHandlingService;

        roomController = new RoomController(stubSocketService, stubSessionHandlingService);
    });

    it('should be created', () => {
        expect(roomController).to.be.ok;
    });

    it('should call emit when a message is received from the user', () => {
        const message: Message = {
            title: 'Title',
            body: 'body',
            messageType: MessageType.Log,
            userId: 'user1',
        };

        roomController['handleSockets']();

        const clientSocket = new SocketMock();

        const toRoomSpy = spy(socketServerMock, 'to');

        socketServerMock.triggerEndpoint('connection', clientSocket);
        clientSocket.triggerEndpoint('message', message);

        assert.calledOnce(toRoomSpy);
    });

    it('should tell when a room is full', async () => {
        const socket = new SocketMock() as unknown as Socket;
        expect(await roomController['isRoomFull'](socket, 'full')).to.be.equals(true);
    });
});
