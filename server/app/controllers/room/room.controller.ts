import { Timer } from '@app/classes/delay';
import { Config } from '@app/config';
import { GameService } from '@app/services/game/game.service';
import { SessionHandlingService } from '@app/services/sessionHandling/session-handling.service';
import { SocketService } from '@app/services/socket/socket-service';
import { AvailableGameConfig, Message, MessageType } from '@common';
import { Socket } from 'socket.io';
import { Service } from 'typedi';
import * as logger from 'winston';

const END_GAME_DELAY_MS = 5000;

@Service()
export class RoomController {
    private readonly socketIdToPlayerId: Map<string, string>;

    constructor(
        private readonly socketService: SocketService,
        private readonly sessionHandlingService: SessionHandlingService,
        private readonly gameService: GameService,
    ) {
        this.socketIdToPlayerId = new Map<string, string>();
    }

    private static async isRoomFull(socket: Socket, sessionId: string): Promise<boolean> {
        const maxPlayers = Config.MAX_PLAYERS;
        const roomSockets = await socket.in(sessionId).fetchSockets();

        logger.info(`Inside isRoomFull: ${roomSockets.length}`);

        return roomSockets.length >= maxPlayers;
    }

    handleSockets(): void {
        this.socketService.socketServer.on('connection', (socket) => this.onConnection(socket));
    }

    private onConnection(socket: Socket) {
        logger.info(`Connection with user id: ${socket.id}`);

        socket.on('disconnect', async (reason) => this.onDisconnect(socket, reason));
        socket.on('exit', () => this.onExit(socket));
        socket.on('joinRoom', async (playerId: string) => this.onRoomJoined(socket, playerId));
        socket.on('message', (message: Message) => this.onMessage(socket, message));
        socket.on('getRooms', () => this.onGetRooms(socket));
    }

    private async onDisconnect<T>(socket: Socket, reason: T) {
        logger.info(`User disconnect: ${socket.id} - Reason: ${reason}`);
        const playerId = this.socketIdToPlayerId.get(socket.id);

        if (playerId === undefined) {
            return;
        }

        await Timer.delay(END_GAME_DELAY_MS);
        await this.abandonCreatedGame(socket, playerId);

        this.socketService.socketServer.emit('availableRooms', this.sessionInfos);
    }

    private onExit(socket: Socket) {
        logger.info(`User exited: ${socket.id}`);

        const playerId = this.socketIdToPlayerId.get(socket.id);

        if (playerId === undefined) {
            return;
        }

        this.abandonCreatedGame(socket, playerId);
    }

    private async onRoomJoined(socket: Socket, playerId: string) {
        const sessionHandler = this.sessionHandlingService.getHandlerByPlayerId(playerId);
        if (sessionHandler === null) {
            logger.info(`Invalid room ID provided: ${sessionHandler}`);
            return;
        }

        if (await RoomController.isRoomFull(socket, sessionHandler.sessionInfo.id)) {
            logger.info(`Room is full: ${sessionHandler.sessionInfo.id}`);
            return;
        }

        await socket.join([sessionHandler.sessionInfo.id, playerId]);
        this.socketIdToPlayerId.set(socket.id, playerId);

        if (sessionHandler.sessionData.isActive && !sessionHandler.sessionData.isStarted) {
            sessionHandler.start();
        }

        logger.info(`Joined room: ${sessionHandler.sessionInfo.id}`);
        this.socketService.socketServer.emit('availableRooms', this.sessionInfos);
    }

    private onMessage(socket: Socket, message: Message) {
        logger.debug(`Socket: ${socket.id} sent ${message.messageType}`);

        const playerId = this.socketIdToPlayerId.get(socket.id) ?? '';
        const sessionHandler = this.sessionHandlingService.getHandlerByPlayerId(playerId);

        if (playerId == null || sessionHandler == null) {
            logger.warn(`Invalid socket id: ${socket.id}`);
            return;
        }

        const otherPlayerId = sessionHandler.players.find((p) => p.id !== playerId)?.id ?? '';

        switch (message.messageType) {
            case MessageType.Message:
                this.socketService.socketServer.in(sessionHandler.sessionInfo.id).emit('message', message);
                break;
            case MessageType.RemoteMessage:
                this.socketService.socketServer.in(otherPlayerId).emit('message', message);
                break;
            default:
                this.socketService.socketServer.to(socket.id).emit('message', message);
        }

        logger.info(`Message sent on behalf of ${socket.id}`);
    }

    private onGetRooms(socket: Socket) {
        const sessionInfo = this.sessionInfos;
        socket.emit('availableRooms', sessionInfo);
    }

    private get sessionInfos(): AvailableGameConfig[] {
        return this.sessionHandlingService.getAvailableSessions().map((s) => ({
            id: s.sessionInfo.id,
            playTimeMs: s.sessionInfo.playTimeMs,
            waitingPlayerName: s.players[0].playerInfo.name,
            isRandomBonus: s.boardHandler.isRandomBonus,
        }));
    }

    private async abandonCreatedGame(socket: Socket, playerId: string) {
        this.socketIdToPlayerId.delete(socket.id);
        await this.gameService.abandon(playerId);

        socket.leave(this.sessionHandlingService.getSessionId(playerId));
        socket.leave(playerId);

        this.socketService.socketServer.emit('availableRooms', this.sessionInfos);
    }
}
