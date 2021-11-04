import http from 'http';
import { Server } from 'socket.io';
import { Service } from 'typedi';
import { SocketHandlerGenerator } from '@app/handlers/socket-handler/socket-handler-generator';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';

@Service()
export class SocketService implements SocketHandlerGenerator {
    socketServer: Server;

    init(server: http.Server): void {
        this.socketServer = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    send<T>(event: string, roomId: string, message?: T) {
        const room = this.socketServer.to(roomId);
        room.emit(event, message);
    }

    generate(id: string): SocketHandler {
        return new SocketHandler(this, id);
    }
}
