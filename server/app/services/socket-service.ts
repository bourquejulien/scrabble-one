import http from 'http';
import { Server } from 'socket.io';
import { Service } from 'typedi';

@Service()
export class SocketService {
    socketServer: Server;

    init(server: http.Server): void {
        this.socketServer = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    send(event: string, message: any, roomId: string) {
        this.socketServer.to(roomId).emit(event, message);
    }
}
