import { Injectable } from '@angular/core';
import { Message, MessageType } from '@app/classes/message';
import { PlayerType } from '@app/classes/player-type';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class MessagingService {
    debuggingMode: boolean;
    socketClient: Socket = io('http://localhost:3000/');
    protected subject = new Subject<Message>();

    send(title: string, body: string, messageType: MessageType, user?: PlayerType): void {
        if (!user) user = PlayerType.Local;
        const message = {
            title,
            body,
            messageType,
            userId: user,
        };

        if (this.debuggingMode) {
            this.socketClient.emit('message', message);
        } else if (message.messageType !== MessageType.Log) {
            this.socketClient.emit('message', message);
        }
    }

    onMessage(): Observable<Message> {
        return this.subject.asObservable();
    }
}
