import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { Service } from 'typedi';

@Service()
export class SessionHandlingService {
    sessionHandlers: SessionHandler[];

    constructor() {
        this.sessionHandlers = [];
    }

    addHandler(sessionHandler: SessionHandler): void {
        this.sessionHandlers.push(sessionHandler);
    }

    removeHandler(id: string): SessionHandler | null {
        const index = this.sessionHandlers.findIndex((e) => e.sessionInfo.id === id);
        if (index < 0) return null;

        this.sessionHandlers[index].destroy();

        return this.sessionHandlers.slice(index, 1)[0];
    }

    getHandler(id: string): SessionHandler | null {
        return this.sessionHandlers.find((e) => e.sessionInfo.id === id) ?? null;
    }
}
