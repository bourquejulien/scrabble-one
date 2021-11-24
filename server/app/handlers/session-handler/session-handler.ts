import { Player } from '@app/classes/player/player';
import { SessionData } from '@app/classes/session-data';
import { SessionInfo } from '@app/classes/session-info';
import { Config } from '@app/config';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { PlayerHandler } from '@app/handlers/player-handler/player-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { GameMode, GameType, ServerConfig } from '@common';
import { Subscription } from 'rxjs';
import * as logger from 'winston';
import { SessionStatsHandler } from '@app/handlers/stats-handlers/session-stats-handler/session-stats-handler';

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
        private statsHandler: SessionStatsHandler,
    ) {
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
            gameMode: this.gameMode,
            playTimeMs: this.sessionInfo.playTimeMs,
            firstPlayerName: firstPlayer.playerInfo.name,
            secondPlayerName: secondPlayer.playerInfo.name,
        };
    }

    start(): void {
        this.sessionData.isActive = true;
        this.sessionData.isStarted = true;
        this.timer = setInterval(() => this.timerTick(), Config.SESSION.REFRESH_INTERVAL_MS);

        this.refresh();
        this.statsHandler.start();
        this.playerHandler.start();

        logger.info(`Game ${this.sessionInfo.id} started`);
    }

    dispose(): void {
        this.sessionData.isActive = false;
        this.sessionData.timeLimitEpoch = 0;
        this.playerHandler.dispose();
        this.playerSubscription.unsubscribe();
        clearInterval(this.timer);
    }

    addPlayer(player: Player): void {
        player.init(this.boardHandler, this.reserveHandler, this.socketHandler, this.statsHandler);
        this.playerHandler.addPlayer(player);
    }

    removePlayer(id: string): Player | null {
        return this.playerHandler.removePlayer(id);
    }

    abandonGame(playerId: string): void {
        logger.debug(`SessionHandler - Abandon - PlayerId: ${playerId}`);
        this.sessionInfo.gameType = GameType.SinglePlayer;
        this.removePlayer(playerId);
    }

    private endGame(): void {
        logger.debug(`SessionHandler - EndGame - Id: ${this.sessionInfo.id}`);

        const winner = this.statsHandler.winner;
        this.socketHandler.sendData('endGame', winner);
        logger.debug(`winner: ${winner}`);

        this.dispose();
    }

    get players(): Player[] {
        return this.playerHandler.players;
    }

    get gameMode(): GameMode {
        return this.statsHandler.gameMode;
    }

    private timerTick(): void {
        const timeLeftMs = Math.max(0, this.sessionData.timeLimitEpoch - new Date().getTime());
        if (timeLeftMs === 0) {
            this.players.forEach((p) => (p.isTurn = false));
        }

        this.socketHandler.sendData('timerTick', { ms: timeLeftMs });
    }

    private onTurn(id: string): void {
        if (this.statsHandler.isEndGame) {
            this.endGame();
            return;
        }

        this.refresh();

        this.players.find((p) => p.id === id)?.startTurn();
        this.sessionData.timeLimitEpoch = new Date().getTime() + this.sessionInfo.playTimeMs;
    }

    private refresh(): void {
        this.socketHandler.sendData('board', this.boardHandler.immutableBoard.boardData);
        this.socketHandler.sendData('reserve', this.reserveHandler.reserve);
    }
}
