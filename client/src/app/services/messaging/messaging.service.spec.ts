/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { MessageType } from '@common';
import { MessagingService } from './messaging.service';

fdescribe('MessagingService', () => {
    let service: MessagingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MessagingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#send should send all messages when debugging is on', () => {
        service.debuggingMode = true;

        service['socket'].socketClient.on('message', (message) => {
            expect(message.messageType).toBe(MessageType.Error);
        });
        service.send('title1', 'body1', MessageType.Error);

        service['socket'].socketClient.on('message', (message) => {
            expect(message.messageType).toBe(MessageType.Log);
        });
        service.send('title2', 'body2', MessageType.Log);

        service['socket'].socketClient.on('message', (message) => {
            expect(message.messageType).toBe(MessageType.Message);
        });
        service.send('title3', 'body3', MessageType.Message);
    });

    it('#send should not send all messages when debugging is off', () => {
        const timerCallback = jasmine.createSpy('timerCallback');
        service.debuggingMode = false;
        service['socket'].socketClient.on('message', () => {
            timerCallback();
        });
        service.send('title1', 'body1', MessageType.Error);
        service.send('title2', 'body2', MessageType.Log);
        service.send('title3', 'body3', MessageType.Message);
        service.send('title4', 'body4', MessageType.System);
        service.send('title4', 'body4', MessageType.Game);
        expect(timerCallback).toHaveBeenCalledTimes(4);
    });
});
