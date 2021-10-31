import { Injectable } from '@angular/core';
import { PlayerType } from '@app/classes/player/player-type';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { MessageType } from '@common';

@Injectable({
    providedIn: 'root',
})
export class MessagingService {
    debuggingMode: boolean;
    constructor(private readonly socket: SocketClientService) {
        this.debuggingMode = false;
    }

    send(title: string, body: string, messageType: MessageType, user?: PlayerType): void {
        if (!user) {
            user = PlayerType.Local;
        }
        const message = {
            title,
            body,
            messageType,
            userId: user,
        };
        this.socket.socketClient.emit('message', message);
    }
}
