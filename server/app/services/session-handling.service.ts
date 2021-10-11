import { Service } from 'typedi';
import { SessionHandler } from '@app/classes/session-handler';
import { SessionInfo } from '@app/classes/session-info';
import { Board } from '@app/classes/board/board';

@Service()
export class SessionHandlingService {
    sessionHandlers: SessionHandler[];

    constructor() {
        this.sessionHandlers = [];
    }

    addHandler(sessionInfo: SessionInfo, board: Board) {
        this.sessionHandlers.push(new SessionHandler(sessionInfo, board));
    }

    removeHandler(id: string): SessionHandler | null {
        const index = this.sessionHandlers.findIndex((e) => e.sessionInfo.id === id);
        if (index < 0) return null;

        return this.sessionHandlers.slice(index, 1)[0];
    }
}
