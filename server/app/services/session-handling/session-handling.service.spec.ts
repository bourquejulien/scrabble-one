/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions -- Needed for chai library assertions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { SessionInfo } from '@app/classes/session-info';
import { expect } from 'chai';
import Sinon, { createStubInstance } from 'sinon';
import { Player } from '@app/classes/player/player';
import { SessionHandlingService } from './session-handling.service';
import { GameType } from '@common';
import { PlayerHandler } from '@app/handlers/player-handler/player-handler';
import { HumanPlayer } from '@app/classes/player/human-player/human-player';
import { VirtualPlayerEasy } from '@app/classes/player/virtual-player/virtual-player-easy/virtual-player-easy';
import { PlayerInfo } from '@app/classes/player-info';
import { SessionData } from '@app/classes/session-data';

const MAX_HANDLERS = 5;
const TIME_MS = 1000;
describe('SessionHandlingService', () => {
    let handler = new SessionHandlingService();
    let stubSessionHandler = createStubInstance(SessionHandler) as unknown as SessionHandler;
    const player = createStubInstance(Player);
    stubSessionHandler.addPlayer(player as unknown as Player);
    const playerInfo: PlayerInfo = { id: '0', name: 'tester1', isHuman: true };
    const id = '0';
    let playerA: Sinon.SinonStubbedInstance<HumanPlayer>;

    beforeEach(() => {
        stubSessionHandler = createStubInstance(SessionHandler) as unknown as SessionHandler;
        const sessionInfo: SessionInfo = { id, playTimeMs: TIME_MS, gameType: GameType.Multiplayer };
        stubSessionHandler.sessionInfo = sessionInfo;
        const sessionData: SessionData = { isActive: false, isStarted: false, timeLimitEpoch: 50 };
        stubSessionHandler.sessionData = sessionData;
        const stubPlayerHandler = createStubInstance(PlayerHandler) as unknown as PlayerHandler;
        playerA = createStubInstance(HumanPlayer);
        const playerB = createStubInstance(VirtualPlayerEasy);
        playerA.startTurn.returns(new Promise<void>(() => {}));
        playerB.startTurn.returns(new Promise<void>(() => {}));
        stubPlayerHandler.addPlayer(playerA as unknown as Player);
        stubPlayerHandler.addPlayer(playerB as unknown as Player);
        stubPlayerHandler.players = [];
        stubSessionHandler['playerHandler'] = stubPlayerHandler;
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
        expect(handler.getHandlerByPlayerId('0')).to.be.null;
    });
    it('should remove handlers when theres some with players in handler', () => {
        handler['playerIds'].set('0', '0');
        playerA.playerInfo = playerInfo;
        handler['sessionHandlers'][0].players.push(playerA as unknown as Player);
        handler.removeHandler('0');
        expect(handler.getHandlerByPlayerId('0')).to.be.null;
    });
    it('should update entries', () => {
        handler['playerIds'].set('0', '0');
        const beforeCallingUpdate = handler['playerIds'];
        expect(beforeCallingUpdate).to.not.eql(handler.updateEntries(stubSessionHandler as unknown as SessionHandler));
    });
    it('should update entries with player in SessionHandler', () => {
        handler['playerIds'].set('0', '0');
        playerA.playerInfo = playerInfo;
        handler['sessionHandlers'][0].players.push(playerA as unknown as Player);
        const beforeCallingUpdate = handler['playerIds'];
        expect(beforeCallingUpdate).to.not.eql(handler.updateEntries(stubSessionHandler as unknown as SessionHandler));
    });
    it('should update entries but with wrong sessionId', () => {
        handler['playerIds'].set('0', 'badOne');
        const beforeCallingUpdate = handler['playerIds'];
        expect(beforeCallingUpdate).to.not.eql(handler.updateEntries(stubSessionHandler as unknown as SessionHandler));
    });
    it('should get session that are started', () => {
        expect(handler.getAvailableSessions().length).to.eql(1);
    });
});
