import { SessionInfo } from '@app/classes/session-info';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ServerConfig } from '@common';
import { Player } from '@app/classes/player/player';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SessionData } from '@app/classes/session-data';
import { Config } from '@app/config';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { PlayerHandler } from '@app/handlers/player-handler/player.handler';
import { Subscription } from 'rxjs';

export class SessionHandler {
    readonly sessionData: SessionData;
    private timer: NodeJS.Timer;
    private readonly playerSubscription: Subscription;

    constructor(
        readonly sessionInfo: SessionInfo,
        readonly boardHandler: BoardHandler,
        readonly reserveHandler: ReserveHandler,
        readonly socketHandler: SocketHandler,
        readonly playerHandler: PlayerHandler,
    ) {
        socketHandler.sessionId = sessionInfo.id;
        this.sessionData = { isActive: false, isStarted: false, timeLimitEpoch: 0 };
        this.playerSubscription = this.playerHandler.onTurn().subscribe(() => this.onTurn());
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
        this.sessionData.isActive = false;

        this.timer = setInterval(() => this.timerTick(), Config.SESSION.REFRESH_INTERVAL_MS);

        return this.playerHandler.start();
    }

    destroy(): void {
        this.sessionData.isActive = false;
        this.sessionData.timeLimitEpoch = 0;
        this.playerHandler.destroy();
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

    private onTurn(): void {
        this.sessionData.timeLimitEpoch = new Date().getTime() + this.sessionInfo.playTimeMs;
    }
}
