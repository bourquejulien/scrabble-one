import { SessionInfo } from '@app/classes/session-info';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ServerGameConfig } from '@common';
import { IPlayer } from '@app/classes/player/player';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';

export class SessionHandler {
    constructor(
        readonly sessionInfo: SessionInfo,
        readonly boardHandler: BoardHandler,
        readonly reserveHandler: ReserveHandler,
        readonly players: IPlayer[],
    ) {
        players.forEach((p) => p.fillRack());
    }

    getServerConfig(id: string): ServerGameConfig {
        const firstPlayer = this.players.find((p) => p.id === id) ?? this.players[0];
        const secondPlayer = this.players.find((p) => p.id !== firstPlayer.id) ?? this.players[1];

        return {
            id: this.sessionInfo.id,
            gameType: this.sessionInfo.gameType,
            playTimeMs: this.sessionInfo.playTimeMs,
            firstPlayerName: firstPlayer.playerInfo.name,
            secondPlayerName: secondPlayer.playerInfo.name,
        };
    }

    destroy(): void {
        // TODO Stop timer or anything running
    }
}
