import { Timer } from '@app/classes/delay';
import { Score } from '@app/classes/score';
import { Config } from '@app/config';
import { GameService } from '@app/services/game/game.service';
import { SessionHandlingService } from '@app/services/sessionHandling/session-handling.service';
import { SocketService } from '@app/services/socket/socket-service';
import { StatsService } from '@app/services/stats/stats.service';
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
        private readonly stats: StatsService,
    ) {
        this.socketIdToPlayerId = new Map<string, string>();
    }

    private static async isRoomFull(socket: Socket, sessionId: string): Promise<boolean> {
        const maxPlayers = Config.MAX_PLAYERS;
        const roomSockets = await socket.in(sessionId).fetchSockets();

        logger.info(`Inside isRoomFull: ${roomSockets.length}`);

        return roomSockets.length >= maxPlayers;
    }

    async handleSockets(): Promise<void> {
        this.socketService.socketServer.on('connection', (socket) => {
            logger.info(`Connection with user id: ${socket.id}`);

            socket.on('disconnect', async (reason) => {
                logger.info(`User disconnect: ${socket.id} - Reason: ${reason}`);
                const playerId = this.socketIdToPlayerId.get(socket.id);

                if (playerId === undefined) {
                    return;
                }

                await Timer.delay(END_GAME_DELAY_MS);
                await this.abandonCreatedGame(socket, playerId);

                this.socketService.socketServer.emit('availableRooms', this.sessionInfos);
            });

            socket.on('exit', () => {
                logger.info(`User exited: ${socket.id}`);

                const playerId = this.socketIdToPlayerId.get(socket.id);

                if (playerId === undefined) {
                    return;
                }

                this.abandonCreatedGame(socket, playerId);
            });

            socket.on('message', (message: Message) => {
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
            });

            socket.on('getRooms', () => {
                const sessionInfo = this.sessionInfos;
                socket.emit('availableRooms', sessionInfo);
            });

            socket.on('add element in db', async () => {
                const scoreBidon: Score = { name: ['James Charlse'], scoreValue: 152 };
                this.stats.scoreService.updateScoreboard(scoreBidon, 'classicScoreboard');

                logger.info(await this.stats.getScoreboardClassic()[0]);
                // logger.info(this.stats.getScoreboardClassic[0].scoreValue);
            });

            socket.on('joinRoom', async (playerId: string) => {
                const sessionId = this.sessionHandlingService.getSessionId(playerId);

                if (sessionId !== '') {
                    if (!(await RoomController.isRoomFull(socket, sessionId))) {
                        socket.join([sessionId, playerId]);
                        this.socketIdToPlayerId.set(socket.id, playerId);
                        logger.info(`Joined room: ${sessionId}`);
                    }
                    this.socketService.socketServer.emit('availableRooms', this.sessionInfos);
                } else {
                    logger.info(`Invalid room ID provided: ${sessionId}`);
                }
            });
        });
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
