import { TestBed } from '@angular/core/testing';
import { MessageType } from '@app/classes/message';
import { MessagingService } from './messaging.service';

describe('MessagingService', () => {
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

        let subscription = service.onMessage().subscribe((message) => {
            expect(message.messageType).toBe(MessageType.Error);
        });
        service.send('title1', 'body1', MessageType.Error);
        subscription.unsubscribe();

        subscription = service.onMessage().subscribe((message) => {
            expect(message.messageType).toBe(MessageType.Log);
        });
        service.send('title2', 'body2', MessageType.Log);
        subscription.unsubscribe();

        subscription = service.onMessage().subscribe((message) => {
            expect(message.messageType).toBe(MessageType.Message);
        });
        service.send('title3', 'body3', MessageType.Message);
        subscription.unsubscribe();
    });

    it('#send should not send all messages when debugging is off', () => {
        const timerCallback = jasmine.createSpy('timerCallback');
        service.debuggingMode = false;
        service.onMessage().subscribe(() => {
            timerCallback();
        });
        service.send('title1', 'body1', MessageType.Error);
        service.send('title2', 'body2', MessageType.Log);
        service.send('title3', 'body3', MessageType.Message);
        service.send('title4', 'body4', MessageType.System);
        expect(timerCallback).toHaveBeenCalledTimes(3);
    });
});
