import http from 'http';
import { Server } from 'socket.io';
import { Service } from 'typedi';

@Service()
export class SocketService {
    socketServer: Server;

    init(server: http.Server): void {
        this.socketServer = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    send<T>(event: string, roomId: string, message?: T) {
        const room = this.socketServer.to(roomId);
        if (message) {
            room.emit(event, message);
        } else {
            room.emit(event);
        }
    }
}
