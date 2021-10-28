import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { MessageType } from '@common';
import { PlayerType } from '@app/classes/player/player-type';

@Injectable({
    providedIn: 'root',
})
export class MessagingService {
    debuggingMode: boolean;
    constructor(private readonly socket: SocketClientService) {}

    send(title: string, body: string, messageType: MessageType, user?: PlayerType): void {
        if (!user) user = PlayerType.Local;
        const message = {
            title,
            body,
            messageType,
            userId: user,
        };

        if (this.debuggingMode) {
            this.socket.socketClient.emit('message', message);
        } else if (message.messageType !== MessageType.Log) {
            this.socket.socketClient.emit('message', message);
        }
    }
}
