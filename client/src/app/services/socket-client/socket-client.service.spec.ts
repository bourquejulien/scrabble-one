/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-empty-function */
import { TestBed } from '@angular/core/testing';
import { SocketMock } from '@app/classes/helpers/socket-test-helper';
import { Socket } from 'socket.io-client';

import { SocketClientService } from './socket-client.service';

describe('SocketClientService', () => {
    let service: SocketClientService;

    beforeEach(() => {
        /*
        io is an imported function and can't be spied upon with Jasmine
        Issue : https://github.com/jasmine/jasmine/issues/1414
        */
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketClientService);
        service['socketClient'] = new SocketMock() as unknown as Socket;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be reset', () => {
        const disconnectSpy = spyOn(service['socketClient'], 'disconnect');
        const connectSpy = spyOn(service['socketClient'], 'connect');
        service.reset();
        expect(disconnectSpy).toHaveBeenCalled();
        expect(connectSpy).toHaveBeenCalled();
    });

    it('should join', () => {
        const roomId = '1';
        const emitSpy = spyOn(service['socketClient'], 'emit');
        service.join(roomId);
        expect(emitSpy).toHaveBeenCalledWith('joinRoom', roomId);
    });

    it('should call socket.on with the correct parameters', () => {
        const event = 'event';
        const action = () => {};
        const socktOnSpy = spyOn(service['socketClient'], 'on');
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        service.on(event, action);
        expect(socktOnSpy).toHaveBeenCalledWith(event, action);
    });

    it('should emit with the correct', () => {
        const event = 'event';
        const message = 'message';
        const emitSpy = spyOn(service['socketClient'], 'emit');
        service.send(event, message);
        expect(emitSpy).toHaveBeenCalledWith(event, message);
        service.send(event);
        expect(emitSpy).toHaveBeenCalledWith(event);
    });
});
