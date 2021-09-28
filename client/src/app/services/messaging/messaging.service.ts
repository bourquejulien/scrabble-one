import { Injectable } from '@angular/core';
import { Message, MessageType } from '@app/classes/message';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MessagingService {
    debuggingMode: boolean; // When debugging is on, we send error and log messages
    protected subject = new Subject<Message>();

    send(title: string, body: string, messageType: MessageType): void {
        const message = {
            title,
            body,
            messageType,
            userId: 1, // TODO: put the current user's
            timestamp: Date.now(),
        };

        if (this.debuggingMode) {
            this.subject.next(message);
        } else if (message.messageType === MessageType.Message) {
            this.subject.next(message);
        }
    }

    onMessage(): Observable<Message> {
        return this.subject.asObservable();
    }
}
