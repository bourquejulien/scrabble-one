import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MessagingService {
    debuggingMode: boolean; // When debugging is on, we send error and log messages
    private subject = new Subject<Message>();

    log(title: string, body: string): void {
        this.sendMessage({
            title,
            body,
            messageType: 'Log',
            userId: 1,
            timestamp: Date.now(),
        });
    }

    sendUserMessage(input: string) {
        this.sendMessage({
            title: '',
            body: `${input}`,
            messageType: 'UserMessage',
            userId: 1,
            timestamp: Date.now(),
        });
    }

    onMessage(): Observable<Message> {
        return this.subject.asObservable();
    }

    private sendMessage(message: Message) {
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
}
