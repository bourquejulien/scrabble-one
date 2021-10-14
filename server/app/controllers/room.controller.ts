/* eslint-disable no-console */
import { Message, MessageType } from '@common/message';
import { PlayerType } from '@common/player-type';
import * as http from 'http';
import { Server } from 'socket.io';

export class RoomController {
    private serverIO: Server;
    private rooms: string[] = [];

    constructor(server: http.Server) {
        this.serverIO = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    socketHandler(): void {
        this.serverIO.on('connection', (socket) => {
            console.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
            const helloMsg: Message = {
                title: 'System',
                body: 'Hello, World',
                messageType: MessageType.Message,
                userId: PlayerType.Virtual,
            };
            socket.emit('message', helloMsg);

            socket.on('disconnect', (reason) => {
                console.log(`Deconnexion par l'utilisateur avec id : ${socket.id}`);
                console.log(`Raison de deconnexion : ${reason}`);
            });

            socket.on('message', (message: Message) => {
                // TODO: when room are functional socket.broadcast.to('testroom').emit('message', message);
                this.serverIO.emit('message', message);
                console.log('Message sent on behalf of', socket.id);
            });

            socket.on('JoinRoom', (roomId: string) => {
                if (this.rooms.) {
                    socket.join(roomId);
                }
            });
        });
    }
}
