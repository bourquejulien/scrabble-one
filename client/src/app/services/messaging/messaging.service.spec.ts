/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SocketMock } from '@app/classes/helpers/socket-test-helper';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Message, MessageType } from '@common';
import { MessagingService } from './messaging.service';

describe('MessagingService', () => {
    let service: MessagingService;
    let socketServiceSpyObj: jasmine.SpyObj<SocketClientService>;
    let socketClient: SocketMock;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        socketClient = new SocketMock();
        socketServiceSpyObj = jasmine.createSpyObj('SocketClientService', ['on', 'reset', 'send'], { socketClient });
        const callback = (event: string, action: (Param: any) => void) => {
            action({});
        };
        socketServiceSpyObj.on.and.callFake(callback);
        TestBed.configureTestingModule({
            providers: [{ provide: SocketClientService, useValue: socketServiceSpyObj }],
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(MessagingService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should trigger callback on message reception', () => {
        socketClient.triggerEndpoint('message', {} as unknown as Message);
        expect(socketServiceSpyObj['on']).toHaveBeenCalled();
    });

    it('should trigger callback on error thrown', () => {
        socketClient.triggerEndpoint('connect_error', () => {});
        expect(socketServiceSpyObj['on']).toHaveBeenCalled();
    });

    it('send should send messages when debugging is on', () => {
        service.isDebug = true;
        service.send('title1', 'body1', MessageType.Error);
        expect(socketServiceSpyObj['send']).toHaveBeenCalled();
    });

    it('send should not send all messages when debugging is off', () => {
        service.isDebug = false;
        service.send('title1', 'body1', MessageType.Error);
        service.send('title2', 'body2', MessageType.Log);
        service.send('title3', 'body3', MessageType.Message);
        service.send('title4', 'body4', MessageType.System);
        expect(socketServiceSpyObj['send']).toHaveBeenCalledTimes(4);
    });

    it('should reset connection with server if it fails', () => {
        const error: Error = { name: 'error', message: 'websocket error' };

        service['handleConnectionError'](error);
        expect(socketServiceSpyObj['reset']).toHaveBeenCalled();
    });

    it('should reset connection with server if it fails', () => {
        const error: Error = { name: 'error', message: 'websocket error' };

        let message = '';
        service['onMessageSubject'].subscribe((msg: { body: string; }) => {
            message = msg.body;
        });
        service['handleConnectionError'](error);
        expect(message).toBe('Erreur: ' + error.message);
    });

    it('should return message if onMessage is called', () => {
        service['onMessageSubject'].next({ title: 'title1', body: 'body1', messageType: MessageType.Error });
        const onMessagePropertyObs = service['onMessageSubject'].asObservable();
        const messageObs = service.onMessage;
        expect(messageObs).toEqual(onMessagePropertyObs);
    });
});
