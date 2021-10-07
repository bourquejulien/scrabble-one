import { Message } from '@app/message';
import * as http from 'http';
import { Server } from 'socket.io';

export class RoomController {
    private serverIO: Server;
    // private testRoom: string = 'testRoom';
    constructor(server: http.Server) {
        this.serverIO = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    socketHandler(): void {
        this.serverIO.on('connection', (socket) => {
            console.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
            socket.emit('hello', 'Hello Wolrd!');

            socket.on('disconnect', (reason) => {
                console.log(`Deconnexion par l'utilisateur avec id : ${socket.id}`);
                console.log(`Raison de deconnexion : ${reason}`);
            });

            socket.on('message', (message: Message) => {
                this.serverIO.emit('message', message);
            });
        });
    }

    /* private emitTime(): void {
        this.serverIO.sockets.emit('clock', new Date().toLocaleTimeString());
    }*/
}
