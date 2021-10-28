import { SessionInfo } from '@app/classes/session-info';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ServerConfig } from '@common';
import { Player } from '@app/classes/player/player';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SessionData } from '@app/classes/session-data';
import { Config } from '@app/config';
import { Subscription } from 'rxjs';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import * as logger from 'winston';

export class SessionHandler {
    readonly sessionData: SessionData;
    readonly players: Player[];

    private readonly playerSubscriptions: Map<string, Subscription>;
    private timer: NodeJS.Timer;

    constructor(
        readonly sessionInfo: SessionInfo,
        readonly boardHandler: BoardHandler,
        readonly reserveHandler: ReserveHandler,
        readonly socketHandler: SocketHandler,
    ) {
        this.players.forEach((p) => p.fillRack());
        this.sessionData = { isActive: false, isStarted: false, timeLimitEpoch: 0 };
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

    start() {
        this.sessionData.isActive = true;
        this.sessionData.isActive = false;

        this.players.forEach((p) => p.fillRack());
        this.timer = setInterval(() => this.timerTick(), Config.SESSION.REFRESH_INTERVAL_MS);

        this.initialTurn();
    }

    destroy(): void {
        this.sessionData.isActive = false;
        this.sessionData.timeLimitEpoch = 0;
        this.playerSubscriptions.forEach((s) => s.unsubscribe());
        clearInterval(this.timer);
    }

    addPlayer(player: Player): void {
        player.init(this.boardHandler, this.reserveHandler, this.socketHandler);
        this.playerSubscriptions[player.id] = player.onTurn().subscribe((lastId) => this.onTurn(lastId));

        this.players.push(player);
    }

    removePlayer(id: string): Player | null {
        const playerIndex = this.players.findIndex((p) => p.id === id);

        if (playerIndex < 0) return null;

        const removedPlayer = this.players.splice(playerIndex, 1)[0];

        this.playerSubscriptions.get(removedPlayer.id)?.unsubscribe();
        this.playerSubscriptions.delete(removedPlayer.id);

        return removedPlayer;
    }

    private timerTick(): void {
        const timeLeftMs = Math.max(0, this.sessionData.timeLimitEpoch - new Date().getTime());

        if (timeLeftMs === 0) {
            this.players.forEach((p) => (p.isTurn = false));
        }

        this.socketHandler.sendData('timertick', timeLeftMs);
    }

    private initialTurn(): void {
        const randomPlayerIndex = Math.floor(this.players.length * Math.random());

        this.onTurn(this.players[randomPlayerIndex].id);
    }

    private onTurn(lastId: string): void {
        const nextPlayer = this.players.find((p) => p.id !== lastId);
        this.sessionData.timeLimitEpoch = new Date().getTime() + this.sessionInfo.playTimeMs;

        logger.debug(`NextTurn - Session: ${this.sessionInfo.id} - LastPLayer: ${lastId} - NextPlayer: ${nextPlayer?.id ?? ''}`);

        nextPlayer?.startTurn();
    }
}
