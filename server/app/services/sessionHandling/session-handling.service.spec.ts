/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions -- Needed for chai library assertions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { SessionInfo } from '@app/classes/session-info';
import { expect } from 'chai';
import { createStubInstance } from 'sinon';
import { Player } from '@app/classes/player/player';
import { SessionHandlingService } from './session-handling.service';
import { GameType } from '@common';
import { PlayerHandler } from '@app/handlers/player-handler/player-handler';

const MAX_HANDLERS = 5;
const TIME_MS = 1000;

describe('SessionHandlingService', () => {
    const service = new SessionHandlingService();

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('should not remove handlers when theres none', () => {
        service.removeHandler('0');
        expect(service.removeHandler).to.be.null;
    });

    it('should add handlers', () => {
        for (let id = 0; id < MAX_HANDLERS; id++) {
            const idAsString: string = id.toString();
            const sessionInfo: SessionInfo = { id: idAsString, playTimeMs: TIME_MS, gameType: GameType.Multiplayer };
            const stubSessionHandler = createStubInstance(SessionHandler) as unknown as SessionHandler;
            stubSessionHandler['sessionInfo'] = sessionInfo;
            service.addHandler(stubSessionHandler);
            expect(service.getHandlerBySessionId(idAsString)).to.be.not.null;
        }
    });
    it('should remove handlers when theres some', () => {
        const id = '0';
        const sessionInfo: SessionInfo = { id, playTimeMs: TIME_MS, gameType: GameType.Multiplayer };
        const stubSessionHandler = createStubInstance(SessionHandler) as unknown as SessionHandler;
        stubSessionHandler['sessionInfo'] = sessionInfo;
        const stubPlayerHandler = createStubInstance(PlayerHandler) as unknown as PlayerHandler;
        stubPlayerHandler['players'] = [createStubInstance(Player) as unknown as Player, createStubInstance(Player) as unknown as Player];
        stubSessionHandler['playerHandler'] = stubPlayerHandler;
        service.addHandler(stubSessionHandler);
        service.removeHandler(id);
        expect(service.getHandlerBySessionId(id)).to.be.null;
    });
    it('should get handler', () => {
        const handler: SessionHandler | null = service.getHandlerBySessionId('0');
        expect(handler?.sessionInfo.id).to.equal('0');
    });
});
