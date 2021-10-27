import http from 'http';
import { Server } from 'socket.io';
import { Service } from 'typedi';
import { Message } from '@common';

@Service()
export class SocketService {
    socketServer: Server;

    init(server: http.Server): void {
        this.socketServer = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    send(event: string, message: Message, roomId: string) {
        this.socketServer.to(roomId).emit(event, message);
    }
}
