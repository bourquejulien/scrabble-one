import { Injectable } from '@angular/core';
import { Message, MessageType } from '@common/message';
import { PlayerType } from '@common/player-type';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class MessagingService {
    debuggingMode: boolean;
    socketClient: Socket = io('http://localhost:3000/');
    rooms: string[] = [];
    protected subject = new Subject<Message>();

    constructor() {
        this.socketClient.on('SendRooms', (rooms: string[]) => {
            this.rooms = rooms;
        });
    }

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

    joinRoom(roomID: string) {
        this.socketClient.emit('JoinRoom', roomID);
    }
}
