/* eslint-disable no-console */ // easier logging for the server
import { Message } from '@common';
import { Socket } from 'socket.io';
import { Service } from 'typedi';
import { SocketService } from '@app/services/socket-service';
import { SessionHandlingService } from '@app/services/session-handling.service';
import { Config } from '@app/config';

@Service()
export class RoomController {
    private availableRooms: string[] = [];

    constructor(private readonly socketService: SocketService, private readonly sessionHandlingService: SessionHandlingService) {}

    async isRoomFull(socket: Socket, roomId: string): Promise<boolean> {
        const maxPlayers = Config.MAX_PLAYERS;
        const roomSockets = await socket.in(roomId).fetchSockets();
        console.log('Inside isRoomFull');
        console.log(roomSockets.length);

        return roomSockets.length >= maxPlayers;
    }

    socketHandler(): void {
        this.socketService.socketServer.on('connection', (socket) => {
            console.log(`Connexion par l'utilisateur avec id : ${socket.id}`);

            socket.on('disconnect', (reason) => {
                console.log(`Déconnexion par l'utilisateur avec id : ${socket.id} raison: ${reason}`);
            });

            socket.on('message', (message: Message) => {
                // TODO: when room are functional socket.broadcast.to('testroom').emit('message', message);
                this.socketService.socketServer.emit('message', message);
                console.log('Message sent on behalf of', socket.id);
            });

            socket.on('getRooms', () => {
                socket.emit('availableRooms', this.sessionHandlingService.availableSessions);
            });

            socket.on('virtualPlayerJoin', (sessionID: string) => {
                socket.join(sessionID);
                console.log('Virtual player joined a room', sessionID);
            });

            socket.on('joinRoom', async (playerId: string) => {
                const sessionId = this.sessionHandlingService.getSessionId(playerId);

                if (sessionId !== '') {
                    console.log('Joined room: ', sessionId);

                    if (!(await this.isRoomFull(socket, sessionId))) {
                        socket.join(sessionId);
                    }

                    this.socketService.socketServer.emit('availableRooms', this.availableRooms);
                } else {
                    console.log('Invalid room ID provided: ', sessionId);
                }
            });
        });
    }
}
