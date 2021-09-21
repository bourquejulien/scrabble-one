import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MessagingService {
    debuggingMode: boolean; // When debugging is on, we send error and log messages
    private subject = new Subject<Message>();

    sendMessage(message: Message) {
        if (this.debuggingMode) {
            // Every message passes through when debugging is on
            this.subject.next(message);
        } else {
            // If debugging is turned off, then we only show user messages
            if (!this.isSystemMessage(message)) {
                this.subject.next(message);
            }
        }
    }

    onMessage(): Observable<Message> {
        return this.subject.asObservable();
    }

    isSystemMessage(message: Message) {
        return message.messageType.endsWith('Error') || message.messageType === 'Log';
    }
}
