/* eslint-disable no-console */ // easier logging for the server
import { generateId } from '@app/classes/id';
import { Message, MessageType } from '@common';
import * as http from 'http';
import { Server, Socket } from 'socket.io';

export class RoomController {
    private socketServer: Server;
    private availableRooms: string[] = [];

    constructor(server: http.Server) {
        this.socketServer = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    async isRoomFull(socket: Socket, roomId: string): Promise<boolean> {
        const maxPlayers = 2;
        const roomSockets = await socket.in(roomId).fetchSockets();
        console.log('Inside isRoomFull');
        console.log(roomSockets.length);

        return roomSockets.length >= maxPlayers;
    }

    socketHandler(): void {
        this.socketServer.on('connection', (socket) => {
            console.log(`Connexion par l'utilisateur avec id : ${socket.id}`);

            socket.on('disconnect', (reason) => {
                console.log(`Déconnexion par l'utilisateur avec id : ${socket.id} raison: ${reason}`);
            });

            socket.on('message', (message: Message) => {
                // TODO: when room are functional socket.broadcast.to('testroom').emit('message', message);
                console.log(message.messageType);
                if (message.messageType === MessageType.Message) {
                    this.socketServer.emit('message', message);
                    console.log('Message sent on behalf of', socket.id);
                } else {
                    this.socketServer.to(socket.id).emit('message', message);
                }
            });

            socket.on('newOnlineGame', () => {
                const roomId = generateId();
                this.availableRooms.push(roomId);

                socket.join(roomId);
                console.log('Created room: ', roomId);
            });

            socket.on('getRooms', () => {
                socket.emit('availableRooms', this.availableRooms);
            });

            socket.on('joinRoom', async (roomId: string) => {
                const roomIndex = this.availableRooms.indexOf(roomId);

                if (roomIndex !== -1) {
                    console.log('Joined room: ', roomId);
                    socket.join(roomId);

                    const isCurrentRoomFull = await this.isRoomFull(socket, roomId);

                    if (isCurrentRoomFull) {
                        console.log('Room is already full');
                        this.availableRooms.splice(roomIndex, 1);
                    }
                    this.socketServer.emit('availableRooms', this.availableRooms);
                } else {
                    console.log('Invalid room ID provided: ', roomId);
                }
            });
        });
    }
}
