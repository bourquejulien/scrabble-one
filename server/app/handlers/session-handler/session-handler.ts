import { SessionInfo } from '@app/classes/session-info';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ServerGameConfig } from '@common';
import { IPlayer } from '@app/classes/player/player';

export class SessionHandler {
    constructor(readonly sessionInfo: SessionInfo, readonly boardHandler: BoardHandler, readonly players: IPlayer[]) {}

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
