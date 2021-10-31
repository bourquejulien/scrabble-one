import { SessionInfo } from '@app/classes/session-info';
import { ServerConfig, SessionStats } from '@common';
import { Player } from '@app/classes/player/player';
import { SessionData } from '@app/classes/session-data';
import { Config } from '@app/config';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { PlayerHandler } from '@app/handlers/player-handler/player-handler';
import { Subscription } from 'rxjs';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import * as logger from 'winston';

export class SessionHandler {
    sessionData: SessionData;
    private timer: NodeJS.Timer;
    private readonly playerSubscription: Subscription;

    constructor(
        public sessionInfo: SessionInfo,
        public boardHandler: BoardHandler,
        public reserveHandler: ReserveHandler,
        private playerHandler: PlayerHandler,
        private socketHandler: SocketHandler,
    ) {
        socketHandler.sessionId = sessionInfo.id;
        this.sessionData = { isActive: false, isStarted: false, timeLimitEpoch: 0 };
        this.playerSubscription = this.playerHandler.onTurn().subscribe((id) => this.onTurn(id));
    }

    getServerConfig(id: string): ServerConfig {
        const firstPlayer = this.players.find((p) => p.id === id) ?? this.players[0];
        const secondPlayer = this.players.find((p) => p.id !== firstPlayer.id) ?? this.players[1];

        return {
            id: firstPlayer.id,
            gameType: this.sessionInfo.gameType,
            playTimeMs: this.sessionInfo.playTimeMs,
            firstPlayerName: firstPlayer.playerInfo.name,
            secondPlayerName: secondPlayer.playerInfo.name,
        };
    }

    start(): string {
        this.sessionData.isActive = true;
        this.timer = setInterval(() => this.timerTick(), Config.SESSION.REFRESH_INTERVAL_MS);
        return this.playerHandler.start();
    }

    addPlayer(player: Player): void {
        player.init(this.boardHandler, this.reserveHandler, this.socketHandler);
        this.playerHandler.addPlayer(player);
    }

    removePlayer(id: string): Player | null {
        return this.playerHandler.removePlayer(id);
    }

    dispose(): void {
        this.sessionData.isActive = false;
        this.sessionData.timeLimitEpoch = 0;
        this.playerHandler.dispose();
        this.playerSubscription.unsubscribe();
        clearInterval(this.timer);
    }

    getStats(id: string): SessionStats | null {
        const firstPlayer = this.players.find((p) => p.id === id);
        const secondPlayer = this.players.find((p) => p.id !== firstPlayer?.id ?? '');

        if (firstPlayer == null || secondPlayer == null) {
            return null;
        }

        return { localStats: firstPlayer.stats, remoteStats: secondPlayer.stats };
    }

    get players(): Player[] {
        return this.playerHandler.players;
    }

    private timerTick(): void {
        const timeLeftMs = Math.max(0, this.sessionData.timeLimitEpoch - new Date().getTime());

        if (timeLeftMs === 0) {
            this.players.forEach((p) => (p.isTurn = false));
        }

        this.socketHandler.sendData('timerTick', timeLeftMs);
    }

    private onTurn(id: string): void {
        if (this.isEndGame) {
            this.endGame();
            return;
        }

        this.players.find((p) => p.id === id)?.startTurn();
        this.sessionData.timeLimitEpoch = new Date().getTime() + this.sessionInfo.playTimeMs;
    }

    private endGame(): void {
        logger.debug(`SessionHandler - EndGame - Id: ${this.sessionInfo.id}`);
        this.players.forEach((p) => (p.playerData.scoreAdjustment -= p.rackPoints()));

        if (this.reserveHandler.length === 0 && this.playerHandler.rackEmptied) {
            this.players[0].playerData.scoreAdjustment += this.players[1].rackPoints();
            this.players[1].playerData.scoreAdjustment += this.players[0].rackPoints();
        }

        this.socketHandler.sendData('endGame');

        this.dispose();
    }

    private get isEndGame(): boolean {
        return this.playerHandler.isOverSkipLimit || (this.reserveHandler.length === 0 && this.playerHandler.rackEmptied);
    }
}
