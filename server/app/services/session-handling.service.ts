import { Service } from 'typedi';
import { SessionHandler } from '@app/classes/session-handler';
import { SessionInfo } from '@app/classes/session-info';
import { Board } from '@app/classes/board/board';
import { generateId } from '@app/classes/id';

@Service()
export class SessionHandlingService {
    sessionHandlers: SessionHandler[];

    constructor() {
        this.sessionHandlers = [];
    }

    addHandler(sessionInfo: SessionInfo, board: Board): string {
        const id = generateId();
        this.sessionHandlers.push(new SessionHandler(id, sessionInfo, board));
        return id;
    }

    removeHandler(id: string): SessionHandler | null {
        const index = this.sessionHandlers.findIndex((e) => e.id === id);
        if (index < 0) return null;

        return this.sessionHandlers.slice(index, 1)[0];
    }

    getHandler(id: string): SessionHandler | null {
        return this.sessionHandlers.find((e) => e.id === id) ?? null;
    }
}
