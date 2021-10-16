/* eslint-disable no-console */ // easier logging for the server
import { Message } from '@common';
import * as http from 'http';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

export class RoomController {
    private socketServer: Server;
    private availableRooms: string[] = [];

    constructor(server: http.Server) {
        this.socketServer = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    async isRoomFull(socket: Socket, roomId: string): Promise<boolean> {
        const maxPlayers = 2;
        const roomSockets = await socket.in(roomId).fetchSockets();
        if (roomSockets.length >= maxPlayers) {
            return true;
        }
        return false;
    }

    socketHandler(): void {
        this.socketServer.on('connection', (socket) => {
            console.log(`Connexion par l'utilisateur avec id : ${socket.id}`);

            socket.on('disconnect', (reason) => {
                console.log(`Deconnexion par l'utilisateur avec id : ${socket.id} raison: ${reason}`);
            });

            socket.on('message', (message: Message) => {
                // TODO: when room are functional socket.broadcast.to('testroom').emit('message', message);
                this.socketServer.emit('message', message);
                console.log('Message sent on behalf of', socket.id);
            });

            socket.on('newOnlineGame', () => {
                this.availableRooms.push(uuidv4());
            });

            socket.on('getRooms', () => {
                socket.emit('availableRooms', this.availableRooms);
            });

            socket.on('joinRoom', async (roomId: string) => {
                const roomIndex = this.availableRooms.indexOf(roomId);

                if (roomIndex !== -1) {
                    console.log('Joined room: ', roomId);
                    if (await this.isRoomFull(socket, roomId)) {
                        console.log('Room is already full');
                        this.availableRooms.splice(roomIndex, 1);
                    }
                    socket.join(roomId);
                }
                else if (roomId === '') {
                    const newRoomID = uuidv4();
                    this.availableRooms.push(newRoomID);
                    socket.join(newRoomID);
                    console.log(`New room created with ID ${newRoomID} for socketID ${socket.id}`);
                    this.socketServer.emit('availableRooms', this.availableRooms);
                } else {
                    console.log('Invalid room ID provided: ', roomId);
                }
            });
        });
    }
}
