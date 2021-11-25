import { Injectable } from '@angular/core';
import { SessionService } from '@app/services/session/session.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Message, MessageType } from '@common';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MessagingService {
    isDebug: boolean;

    private onMessageSubject: Subject<Message>;

    constructor(private readonly socketService: SocketClientService, private readonly sessionService: SessionService) {
        this.isDebug = false;
        this.onMessageSubject = new Subject<Message>();

        this.socketService.on('message', (message: Message) => this.onMessageSubject.next(message));
        this.socketService.on('connect_error', (error: Error) => this.handleConnectionError(error));
    }

    send(title: string, body: string, messageType: MessageType): void {
        const message: Message = {
            title,
            body,
            messageType,
            fromId: this.sessionService.id,
        };
        this.socketService.send('message', message);
    }

    private handleConnectionError(error: Error) {
        const socketErrorMsg: Message = {
            title: 'Connexion avec le serveur perdue',
            body: `Erreur: ${error.message}`,
            messageType: MessageType.Error,
            fromId: this.sessionService.id,
        };
        this.socketService.reset();

        this.onMessageSubject.next(socketErrorMsg);
    }

    get onMessage(): Observable<Message> {
        return this.onMessageSubject.asObservable();
    }
}
