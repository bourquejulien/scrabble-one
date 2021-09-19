import { TestBed } from '@angular/core/testing';
import { Message } from '@app/classes/message';
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

    it('should correctly return an observable that contains the expected message', () => {
        const message: Message = {
            title: '',
            body: 'Test',
            messageType: 'Log',
            userId: 1,
            timestamp: Date.now(),
        };

        service.sendMessage(message);

        service.onMessage().subscribe((value) => {
            expect(value).toBe(message);
        });
    });
});
