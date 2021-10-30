/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
import { expect } from 'chai';
import { RoomController } from './room.controller';
import { createSandbox, createStubInstance, SinonStubbedInstance } from 'sinon';
import { SessionHandlingService } from '@app/services/session-handling.service';
import { SocketService } from '@app/services/socket-service';
import { Server, Socket } from 'socket.io';
import { Message, MessageType, SocketMock } from '@common';

describe('RoomController', () => {
    let roomController: RoomController;
    let socketServerMock: SocketMock;
    beforeEach(() => {
        const stubSocketService: SinonStubbedInstance<SocketService> = createStubInstance(SocketService);
        socketServerMock = new SocketMock();
        stubSocketService['socketServer'] = socketServerMock as unknown as Server;
        const stubSessionHandlingService = createStubInstance(SessionHandlingService) as unknown as SessionHandlingService;
        roomController = new RoomController(stubSocketService, stubSessionHandlingService);
    });

    it('should be created', () => {
        expect(roomController).to.be.ok;
    });

    it('should return true when room ID is invalid', () => {
        const sandbox = createSandbox();
        const stubEmit = sandbox.stub(roomController['socketService']['socketServer'], 'emit');
        sandbox.assert.calledOnce(stubEmit);

        const message: Message = {
            title: 'Title',
            body: 'body',
            messageType: MessageType.Log,
            userId: 'user1',
        };

        const clientSocket = new SocketMock();
        roomController['socketHandler']();
        socketServerMock.oppositeEndpointEmit('connection', clientSocket);
        clientSocket.oppositeEndpointEmit('message', message);
    });

    it('should call', async () => {
        const socket = new SocketMock() as unknown as Socket;
        expect(await roomController['isRoomFull'](socket, 'full')).to.be.equals(true);
    });
});
