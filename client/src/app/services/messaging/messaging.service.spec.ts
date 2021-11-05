/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { MessageType } from '@common';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { MessagingService } from './messaging.service';
import { SocketMock } from '@app/classes/socket-test-helper';

describe('MessagingService', () => {
    let service: MessagingService;
    let socketServiceSpyObj: jasmine.SpyObj<SocketClientService>;
    const socketClient: SocketMock = new SocketMock();

    beforeEach(() => {
        socketServiceSpyObj = jasmine.createSpyObj('SocketClientService', ['on'], { socketClient });
        TestBed.configureTestingModule({
            providers: [{ provide: SocketClientService, useValue: socketServiceSpyObj }],
        });
        service = TestBed.inject(MessagingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('send should send all messages when debugging is on', () => {
        service.isDebug = true;

        service['socketService'].socketClient.on('message', (message) => {
            expect(message.messageType).toBe(MessageType.Error);
        });
        service.send('title1', 'body1', MessageType.Error);

        service['socketService'].socketClient.on('message', (message) => {
            expect(message.messageType).toBe(MessageType.Log);
        });
        service.send('title2', 'body2', MessageType.Log);

        service['socketService'].socketClient.on('message', (message) => {
            expect(message.messageType).toBe(MessageType.Message);
        });
        service.send('title3', 'body3', MessageType.Message);
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
});
