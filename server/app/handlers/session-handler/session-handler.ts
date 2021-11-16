import { SessionInfo } from '@app/classes/session-info';
import { ServerConfig } from '@common';
import { Player } from '@app/classes/player/player';
import { SessionData } from '@app/classes/session-data';
import { Config } from '@app/config';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { PlayerHandler } from '@app/handlers/player-handler/player-handler';
import { Subscription } from 'rxjs';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import * as logger from 'winston';
import { SocketService } from '@app/services/socket/socket-service';

export class SessionHandler {
    sessionData: SessionData;
    private timer: NodeJS.Timer;

    private readonly playerSubscription: Subscription;
    private socketHandler: SocketHandler;

    constructor(
        public sessionInfo: SessionInfo,
        public boardHandler: BoardHandler,
        public reserveHandler: ReserveHandler,
        private playerHandler: PlayerHandler,
        socketService: SocketService,
    ) {
        this.socketHandler = socketService.generate(sessionInfo.id);
        this.sessionData = { isActive: false, isStarted: false, timeLimitEpoch: 0 };
        this.playerSubscription = this.playerHandler.onTurn().subscribe((id) => this.onTurn(id));
    }

    getServerConfig(sessionId: string): ServerConfig {
        const firstPlayer = this.players.find((p) => p.id === sessionId) ?? this.players[0];
        const secondPlayer = this.players.find((p) => p.id !== firstPlayer.id) ?? this.players[1];

        return {
            id: firstPlayer.id,
            startId: this.players.filter((p) => p.isTurn).map((p) => p.id)[0] ?? '',
            gameType: this.sessionInfo.gameType,
            playTimeMs: this.sessionInfo.playTimeMs,
            firstPlayerName: firstPlayer.playerInfo.name,
            secondPlayerName: secondPlayer.playerInfo.name,
        };
    }

    start(): void {
        this.sessionData.isActive = true;
        this.sessionData.isStarted = true;
        this.timer = setInterval(() => this.timerTick(), Config.SESSION.REFRESH_INTERVAL_MS);
        this.playerHandler.start();
    }

    dispose(): void {
        this.sessionData.isActive = false;
        this.sessionData.timeLimitEpoch = 0;
        this.playerHandler.dispose();
        this.playerSubscription.unsubscribe();
        clearInterval(this.timer);
    }

    addPlayer(player: Player): void {
        player.init(this.boardHandler, this.reserveHandler, this.socketHandler);
        this.playerHandler.addPlayer(player);
    }

    removePlayer(id: string): Player | null {
        return this.playerHandler.removePlayer(id);
    }

    abandon(playerId: string): void {
        logger.debug(`SessionHandler - Abandon - PlayerId: ${playerId}`);

        const winner = this.players.find((p) => p.id !== playerId)?.id ?? '';

        this.socketHandler.sendData('endGame', winner);
        this.dispose();
    }

    private endGame(): void {
        logger.debug(`SessionHandler - EndGame - Id: ${this.sessionInfo.id}`);

        this.players.forEach((p) => (p.playerData.scoreAdjustment -= p.rackPoints()));
        if (this.reserveHandler.length === 0 && this.playerHandler.rackEmptied) {
            this.players[0].playerData.scoreAdjustment += this.players[1].rackPoints();
            this.players[1].playerData.scoreAdjustment += this.players[0].rackPoints();
        }

        this.socketHandler.sendData('endGame', this.playerHandler.winner);
        this.dispose();
    }

    get players(): Player[] {
        return this.playerHandler.players;
    }

    private timerTick(): void {
        const timeLeftMs = Math.max(0, this.sessionData.timeLimitEpoch - new Date().getTime());
        if (timeLeftMs === 0) {
            this.players.forEach((p) => (p.isTurn = false));
        }

        this.socketHandler.sendData('timerTick', { ms: timeLeftMs });
    }

    private onTurn(id: string): void {
        if (this.isEndGame) {
            this.endGame();
            return;
        }

        this.socketHandler.sendData('stats', this.playerHandler.getStats(this.players[0].id), this.players[0].id);
        this.socketHandler.sendData('stats', this.playerHandler.getStats(this.players[1].id), this.players[1].id);
        this.socketHandler.sendData('board', this.boardHandler.immutableBoard.boardData);
        this.socketHandler.sendData('reserve', this.reserveHandler.reserve);

        this.players.find((p) => p.id === id)?.startTurn();
        this.sessionData.timeLimitEpoch = new Date().getTime() + this.sessionInfo.playTimeMs;
    }

    private get isEndGame(): boolean {
        return this.playerHandler.isOverSkipLimit || (this.reserveHandler.length === 0 && this.playerHandler.rackEmptied);
    }
}
