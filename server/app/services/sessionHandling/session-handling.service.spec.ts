/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-useless-constructor */
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
import { HumanPlayer } from '@app/classes/player/human-player/human-player';
import { VirtualPlayer } from '@app/classes/player/virtual-player/virtual-player';

const MAX_HANDLERS = 5;
const TIME_MS = 1000;
describe('SessionHandlingService', () => {
    let handler = new SessionHandlingService();
    let stubSessionHandler = createStubInstance(SessionHandler) as unknown as SessionHandler;
    const player = createStubInstance(Player);
    stubSessionHandler.addPlayer(player as unknown as Player);
    const id = '0';

    beforeEach(() => {
        stubSessionHandler = createStubInstance(SessionHandler) as unknown as SessionHandler;
        const sessionInfo: SessionInfo = { id, playTimeMs: TIME_MS, gameType: GameType.Multiplayer };
        stubSessionHandler.sessionInfo = sessionInfo;
        const stubPlayerHandler = createStubInstance(PlayerHandler) as unknown as PlayerHandler;
        const playerA = createStubInstance(HumanPlayer);
        const playerB = createStubInstance(VirtualPlayer);
        playerA.startTurn.returns(new Promise<void>(() => {}));
        playerB.startTurn.returns(new Promise<void>(() => {}));
        stubPlayerHandler.addPlayer(playerA as unknown as Player);
        stubPlayerHandler.addPlayer(playerB as unknown as Player);
        stubPlayerHandler.players = [];
        stubSessionHandler.playerHandler = stubPlayerHandler;
        handler = new SessionHandlingService();
        handler.addHandler(stubSessionHandler);
    });
    afterEach(() => {
        handler = new SessionHandlingService();
    });
    it('should be created', () => {
        expect(handler).to.be.ok;
    });

    it('should not remove handlers when theres none', () => {
        expect(handler.removeHandler('0')).to.be.null;
    });

    it('should add handlers', () => {
        for (let ids = 0; ids < MAX_HANDLERS; ids++) {
            const idAsString: string = ids.toString();
            const sessionInfo: SessionInfo = { id: idAsString, playTimeMs: TIME_MS, gameType: GameType.Multiplayer };

            stubSessionHandler.sessionInfo = sessionInfo;
            handler.addHandler(stubSessionHandler);
            expect(handler.getHandlerBySessionId(idAsString)).to.be.not.null;
        }
    });
    it('should remove handlers when theres some', () => {
        handler['playerIds'].set('0', '0');
        handler.removeHandler('0');
        expect(handler.getHandlerBySessionId('0')).to.be.null;
    });
    it('should update entries', () => {
        const beforeCallingUpdate = handler['playerIds'];
        expect(beforeCallingUpdate).to.not.eql(handler.updateEntries(stubSessionHandler as unknown as SessionHandler));
    });
});
