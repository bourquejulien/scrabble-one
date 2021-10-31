import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '@environment';
import { SessionService } from '@app/services/session/session.service';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    readonly socketClient: Socket;

    constructor(private readonly sessionService: SessionService) {
        this.socketClient = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });
    }

    join() {
        this.socketClient.emit('joinRoom', this.sessionService.id);
    }

    on<T>(event: string, action: (param: T) => void) {
        this.socketClient.on(event, action);
    }
}
