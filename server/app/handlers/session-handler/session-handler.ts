import { SessionInfo } from '@app/classes/session-info';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ServerGameConfig } from '@common';
import { IPlayer } from '@app/classes/player/player';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SessionData } from '@app/classes/session-data';
import { SocketService } from '@app/services/socket-service';
import { Config } from '@app/config';

export class SessionHandler {
    private readonly sessionData: SessionData;
    private timer: NodeJS.Timer;

    constructor(
        readonly sessionInfo: SessionInfo,
        readonly boardHandler: BoardHandler,
        readonly reserveHandler: ReserveHandler,
        readonly socketService: SocketService,
        readonly players: IPlayer[],
    ) {
        players.forEach((p) => p.fillRack());
        this.sessionData = { isActive: false, timeMs: 0 };
        this.start();
    }

    getServerConfig(id: string): ServerGameConfig {
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

    destroy(): void {
        this.sessionData.isActive = false;
        this.sessionData.timeMs = 0;
        clearInterval(this.timer);
    }

    start() {
        this.sessionData.isActive = true;
        this.timer = setInterval(() => this.timerTick(), Config.SESSION.REFRESH_INTERVAL_MS);
    }

    private timerTick(): void {
        console.log("sadsad");
        //this.socketService.socketServer.to().emit('timerTick');
    }
}
