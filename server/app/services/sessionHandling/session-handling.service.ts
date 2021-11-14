import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { Service } from 'typedi';
interface Playername {
    name: string;
    expert: boolean;
}

@Service()
export class SessionHandlingService {
    readonly defaultBotNames: Playername[] = [
        { name: 'Monique', expert: false },
        { name: 'Claudette', expert: false },
        { name: 'Alphonse', expert: false },
    ];
    virtualPlayerNames: Playername[];
    private sessionHandlers: SessionHandler[];
    private readonly playerIds: Map<string, string>;

    constructor() {
        this.virtualPlayerNames = this.defaultBotNames;
        this.sessionHandlers = [];
        this.playerIds = new Map<string, string>();
    }

    addHandler(sessionHandler: SessionHandler): void {
        this.updateEntries(sessionHandler);
        this.sessionHandlers.push(sessionHandler);
    }

    removeHandler(id: string): SessionHandler | null {
        const sessionId = this.getSessionId(id);

        const index = this.sessionHandlers.findIndex((e) => e.sessionInfo.id === sessionId);
        if (index === -1) return null;

        const sessionHandler = this.sessionHandlers[index];

        sessionHandler.players.forEach((p) => this.playerIds.delete(p.id));
        this.sessionHandlers.splice(index, 1);

        return sessionHandler;
    }

    updateEntries(sessionHandler: SessionHandler): void {
        const idsToRemove: string[] = [];
        for (const [key, value] of this.playerIds) {
            if (value === sessionHandler.sessionInfo.id) {
                idsToRemove.push(key);
            }
        }

        idsToRemove.forEach((id) => this.playerIds.delete(id));
        sessionHandler.players.forEach((p) => this.playerIds.set(p.id, sessionHandler.sessionInfo.id));
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

    getAvailableSessions(): SessionHandler[] {
        return this.sessionHandlers.filter((e) => !e.sessionData.isStarted);
    }
}
