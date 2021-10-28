import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '@environment';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socketClient: Socket = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });

    join(id: string) {
        this.socketClient.emit('joinRoom', id);
    }
}
