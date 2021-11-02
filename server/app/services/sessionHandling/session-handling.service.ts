import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { Service } from 'typedi';

@Service()
export class SessionHandlingService {
    private sessionHandlers: SessionHandler[];
    private readonly playerIds: Map<string, string>;

    constructor() {
        this.sessionHandlers = [];
        this.playerIds = new Map<string, string>();
    }

    addHandler(sessionHandler: SessionHandler): void {
        sessionHandler.players.forEach((p) => this.playerIds.set(p.id, sessionHandler.sessionInfo.id));
        this.sessionHandlers.push(sessionHandler);
    }

    removeHandler(id: string): SessionHandler | null {
        const sessionHandler = this.getHandlerByPlayerId(id);
        if (sessionHandler == null) {
            return null;
        }

        sessionHandler.players.forEach((p) => this.playerIds.delete(p.id));
        sessionHandler.dispose();
        return sessionHandler;
    }

    getHandlerByPlayerId(id: string): SessionHandler | null {
        const sessionId = this.getSessionId(id);
        return this.getHandlerBySessionId(sessionId);
    }

    getHandlerBySessionId(id: string): SessionHandler | null {
        return this.sessionHandlers.find((e) => e.sessionInfo.id === id) ?? null;
    }

    getSessionId(playerId: string): string {
        return this.playerIds.get(playerId) ?? '';
    }

    get availableSessions(): SessionHandler[] {
        return this.sessionHandlers.filter((e) => e.sessionData.isStarted);
    }
}
