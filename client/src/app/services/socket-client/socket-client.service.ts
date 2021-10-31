import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socketClient: Socket;

    constructor() {
        this.socketClient = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });
    }
}
