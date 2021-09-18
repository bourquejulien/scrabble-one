import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MessagingService {
    private subject = new Subject<Message>();

    sendMessage(message: Message) {
        this.subject.next(message);
    }

    onMessage(): Observable<Message> {
        return this.subject.asObservable();
    }
}
