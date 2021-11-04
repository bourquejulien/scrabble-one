/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { SocketMock } from '@app/classes/socket-test-helper';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { MessageType } from '@common';
import { MessagingService } from './messaging.service';

describe('MessagingService', () => {
    let service: MessagingService;
    let socketServiceSpyObj: jasmine.SpyObj<SocketClientService>;
    const socketClient: SocketMock = new SocketMock();

    beforeEach(() => {
        socketServiceSpyObj = jasmine.createSpyObj('SocketClientService', ['on', 'reset'], { socketClient });
        TestBed.configureTestingModule({
            providers: [{ provide: SocketClientService, useValue: socketServiceSpyObj }],
        });
        service = TestBed.inject(MessagingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('send should send messages when debugging is on', () => {
        service.isDebug = true;

        const spyError = spyOn(service['socketService']['socketClient'], 'emit');
        service.send('title1', 'body1', MessageType.Error);
        expect(spyError).toHaveBeenCalled();
    });

    it('send should not send all messages when debugging is off', () => {
        const spy = spyOn(service['socketService'].socketClient, 'emit');
        service.isDebug = false;
        service.send('title1', 'body1', MessageType.Error);
        service.send('title2', 'body2', MessageType.Log);
        service.send('title3', 'body3', MessageType.Message);
        service.send('title4', 'body4', MessageType.System);
        expect(spy).toHaveBeenCalledTimes(4);
    });

    it('should reset connection with server if it fails', () => {
        const error: Error = { name: 'error', message: 'websocket error' };

        service['handleConnectionError'](error);
        expect(socketServiceSpyObj['reset']).toHaveBeenCalled();
    });

    it('should reset connection with server if it fails', () => {
        const error: Error = { name: 'error', message: 'websocket error' };

        let message: string = '';
        service['onMessageSubject'].subscribe(mssg => { message = mssg.body });
        service['handleConnectionError'](error);
        expect(message).toBe('Erreur: ' + error.message);
    });


    it('should return message if onMessage is called', () => {
        service['onMessageSubject'].next({ title: 'title1', body: 'body1', messageType: MessageType.Error });
        let onMessagePropertyObs = service['onMessageSubject'].asObservable();
        let messageObs = service.onMessage;
        expect(messageObs).toEqual(onMessagePropertyObs);
    });
});
