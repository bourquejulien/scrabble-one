import { SessionInfo } from '@app/classes/session-info';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';

export class SessionHandler {
    constructor(readonly id: string, readonly sessionInfo: SessionInfo, readonly boardHandler: BoardHandler) {}

    destroy(): void {
        // TODO Stop timer or anything running
    }
}
