/* eslint-disable max-classes-per-file */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { assert, spy } from 'sinon';
import { SocketService } from './socket-service';
import http from 'http';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';

class HttpServer {}
describe('SocketService', () => {
    let service: SocketService;
    before(() => {
        service = new SocketService();
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('should be initiated', () => {
        const httpServerStub = new HttpServer() as unknown as http.Server;
        service.init(httpServerStub);
    });

    it('should send messages with the correct parameters', () => {
        const emitSpy = spy(service['socketServer'], 'to');
        const roomId = 'room1';
        service.send('eventType', roomId, 'objectPlaceholder');
        assert.calledWith(emitSpy, roomId);
    });

    it('should generate a socketHandler', () => {
        const socketHandler = service.generate('id');
        expect(socketHandler).to.be.instanceOf(SocketHandler);
    });
});
