import { Injectable } from '@angular/core';
import { Message, MessageType } from '@app/classes/message';
import { PlayerType } from '@app/classes/player-type';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MessagingService {
    debuggingMode: boolean;
    protected subject = new Subject<Message>();

    send(title: string, body: string, messageType: MessageType): void {
        const message = {
            title,
            body,
            messageType,
            userId: PlayerType.Local,
            timestamp: Date.now(),
        };

        if (this.debuggingMode) {
            this.subject.next(message);
        } else if (message.messageType !== MessageType.Log) {
            this.subject.next(message);
        }
    }

    onMessage(): Observable<Message> {
        return this.subject.asObservable();
    }
}
