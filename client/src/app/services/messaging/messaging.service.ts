import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Message, MessageType } from '@common';
import { SessionService } from '@app/services/session/session.service';

@Injectable({
    providedIn: 'root',
})
export class MessagingService {
    isDebug: boolean;

    constructor(private readonly socket: SocketClientService, private readonly sessionService: SessionService) {
        this.isDebug = false;
    }

    send(title: string, body: string, messageType: MessageType): void {
        const message: Message = {
            title,
            body,
            messageType,
            fromId: this.sessionService.id,
        };
        this.socket.socketClient.emit('message', message);
    }
}
