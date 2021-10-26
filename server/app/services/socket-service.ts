import http from 'http';
import { Server } from 'socket.io';
import { Service } from 'typedi';
import { Message } from '@common/message';

@Service()
export class SocketService {
    socketServer: Server;
    constructor(server: http.Server) {
        this.socketServer = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    send(message: Message, roomId: string) {
        this.socketServer.to(roomId).emit('message', message);
    }
}
