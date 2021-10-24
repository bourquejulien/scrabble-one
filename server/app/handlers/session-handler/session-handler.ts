import { SessionInfo } from '@app/classes/session-info';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ServerGameConfig } from '@common';
import { IPlayer } from '@app/classes/player/player';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';

export class SessionHandler {
    constructor(
        readonly sessionInfo: SessionInfo,
        readonly boardHandler: BoardHandler,
        reserveHandler: ReserveHandler,
        readonly players: IPlayer[],
    ) {}

    get serverConfig(): ServerGameConfig {
        return {
            id: this.sessionInfo.id,
            gameType: this.sessionInfo.gameType,
            playTimeMs: this.sessionInfo.playTimeMs,
            firstPlayerName: '',
            secondPlayerName: '',
        };
    }

    destroy(): void {
        // TODO Stop timer or anything running
    }
}
