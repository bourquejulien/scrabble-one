/* eslint-disable no-unused-expressions,no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { SocketService } from '@app/services/socket/socket-service';
import { expect } from 'chai';
import { SocketHandler } from './socket-handler';
import { MessageType } from '@common';

class SocketServiceStub {
    isCalled = false;
    send<T>(event: string, roomId: string, message?: T) {
        this.isCalled = true;
    }
}

describe('SocketHandler', () => {
    let handler: SocketHandler;
    let stubbedSocketService: SocketServiceStub;

    before(() => {
        stubbedSocketService = new SocketServiceStub();
        handler = new SocketHandler(stubbedSocketService as unknown as SocketService, '');
    });

    it('should send data', () => {
        handler.sendData('');
        expect(stubbedSocketService.isCalled).to.be.true;
    });

    it('should send message', () => {
        handler.sendMessage({ title: '', body: '', messageType: MessageType.System });
        expect(stubbedSocketService.isCalled).to.be.true;
    });

    it('should return new SocketHandler', () => {
        expect(handler.generate('')).to.be.ok;
    });
});
