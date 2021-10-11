import { SessionInfo } from '@app/classes/session-info';
import { Board } from '@app/classes/board/board';

export class SessionHandler {
    constructor(readonly sessionInfo: SessionInfo, readonly board: Board) {}
}
