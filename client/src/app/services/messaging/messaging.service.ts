import { Injectable } from '@angular/core';
import { MessageType } from '@common/message';
import { PlayerType } from '@common/player-type';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class MessagingService {
    debuggingMode: boolean;
    socketClient: Socket = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });

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
}
