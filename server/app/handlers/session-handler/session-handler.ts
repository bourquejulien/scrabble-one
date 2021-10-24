import { SessionInfo } from '@app/classes/session-info';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ServerGameConfig } from '@common';

export class SessionHandler {
    constructor(readonly sessionInfo: SessionInfo, readonly boardHandler: BoardHandler) {}

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
