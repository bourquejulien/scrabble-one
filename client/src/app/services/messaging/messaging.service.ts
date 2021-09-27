import { Injectable } from '@angular/core';
import { Message, MessageType } from '@app/classes/message';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MessagingService {
    debuggingMode: boolean; // When debugging is on, we send error and log messages
    private subject = new Subject<Message>();

    send(title: string, body: string, messageType: MessageType): void {
        const message = {
            title,
            body,
            messageType,
            userId: 1,
            timestamp: Date.now(),
        };

        if (this.debuggingMode) {
            // Every message passes through when debugging is on
            this.subject.next(message);
        } else {
            // If debugging is turned off, then we only show user messages
            // if (message.messageType === 'Log') {
            this.subject.next(message);
            // }
        }
    }

    onMessage(): Observable<Message> {
        return this.subject.asObservable();
    }
}
