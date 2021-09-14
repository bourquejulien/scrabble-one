import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { MESSAGES } from '@app/services/messages/messages-mock';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MessagesService {
    messages: Message[];
    debuggingMode: boolean;
    constructor() {
        this.getMessages().subscribe((messages) => (this.messages = messages));
    } // Inject : service for chatting

    // TODO: send Message to User
    // TODO: log error
    sendMessage(message: Message) {
        this.messages.push(message);
    }

    getMessages(): Observable<Message[]> {
        const messages = of(MESSAGES);
        return messages;
    }
}
