/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { SessionInfo } from '@app/classes/session-info';
import { GameType, ServerConfig } from '@common';
import { expect } from 'chai';
import { createSandbox, createStubInstance } from 'sinon';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { SessionHandler } from './session-handler';
import { Player } from '@app/classes/player/player';
import { PlayerData } from '@app/classes/player-data';
import { PlayerInfo } from '@app/classes/player-info';
import { Subject } from 'rxjs';
import { PlayerHandler } from '@app/handlers/player-handler/player-handler';
import { Config } from '@app/config';
const TIME_MS = 120 * 1000;
const PLAYER_INFO_A: PlayerInfo = { id: '0', name: 'tester1', isHuman: true };
const PLAYER_INFO_B: PlayerInfo = { id: '1', name: 'tester2', isHuman: false };
const PLAYER_DATA_DEFAULT: PlayerData = { baseScore: 0, scoreAdjustment: 2, skippedTurns: 4, rack: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] };
class PlayerTester extends Player {
    constructor() {
        super();
    }
    async startTurn(): Promise<void> {
        // Does Nothing
        return new Promise<void>(() => {});
    }
}
describe('SessionHandler', () => {
    const sessionInfo: SessionInfo = {
        id: '0',
        playTimeMs: 120 * 1000,
        gameType: GameType.SinglePlayer,
    };
    const turnSubject = new Subject<string>();

    const stubBoardHandler = createStubInstance(BoardHandler);
    const stubReserveHandler = createStubInstance(ReserveHandler);
    const stubSocketHandler = createStubInstance(SocketHandler);
    const stubPlayerHandler = createStubInstance(PlayerHandler);
    let playerA: PlayerTester;
    let playerB: PlayerTester;
    stubPlayerHandler.onTurn.returns(turnSubject.asObservable());

    let handler: SessionHandler = new SessionHandler(
        sessionInfo,
        stubBoardHandler as unknown as BoardHandler,
        stubReserveHandler as unknown as ReserveHandler,
        stubPlayerHandler as unknown as PlayerHandler,
        stubSocketHandler as unknown as SocketHandler,
    ) as unknown as SessionHandler;

    beforeEach(() => {
        stubPlayerHandler.players = [];
        playerA = new PlayerTester();
        playerB = new PlayerTester();
        playerA.playerInfo = PLAYER_INFO_A;
        playerB.playerInfo = PLAYER_INFO_B;
        playerA.isTurn = true;
        playerB.isTurn = false;
        playerA.playerData = PLAYER_DATA_DEFAULT;
        playerB.playerData = PLAYER_DATA_DEFAULT;
        handler.playerHandler.players = [playerA, playerB];
    });

    afterEach(() => {
        handler = new SessionHandler(
            sessionInfo,
            stubBoardHandler as unknown as BoardHandler,
            stubReserveHandler as unknown as ReserveHandler,
            stubPlayerHandler as unknown as PlayerHandler,
            stubSocketHandler as unknown as SocketHandler,
        ) as unknown as SessionHandler;
    });

    it('should be created', () => {
        expect(handler).to.be.ok;
    });

    it('should add players', () => {
        handler.addPlayer(playerA);
        expect(stubPlayerHandler.addPlayer.called).to.be.true;
    });
    it('should return a good server config', () => {
        handler.sessionInfo.id = '0';
        const returnValue = handler.getServerConfig('0');
        const expectedServerConfig: ServerConfig = {
            id: '0',
            startId: '0',
            gameType: GameType.SinglePlayer,
            playTimeMs: TIME_MS,
            firstPlayerName: 'tester1',
            secondPlayerName: 'tester2',
        };
        expect(returnValue).to.eql(expectedServerConfig);
    });

    it('should not return a good server config with both player same id', () => {
        handler.sessionInfo.id = '0';
        playerB.playerInfo.id = '0';
        handler.playerHandler.players = [playerA, playerB];
        const returnValue = handler.getServerConfig('2');
        const expectedServerConfig: ServerConfig = {
            id: '2',
            startId: '',
            gameType: GameType.SinglePlayer,
            playTimeMs: TIME_MS,
            firstPlayerName: 'tester1',
            secondPlayerName: 'tester2',
        };
        playerB.playerInfo.id = '1';
        expect(returnValue).to.not.eql(expectedServerConfig);
    });
    it('should return a good server config while no player isturn', () => {
        handler.sessionInfo.id = '0';
        handler.playerHandler.players[0].isTurn = false;
        handler.playerHandler.players[1].isTurn = false;
        playerB.isTurn = false;
        const returnValue = handler.getServerConfig('0');
        const expectedServerConfig: ServerConfig = {
            id: '0',
            startId: '',
            gameType: GameType.SinglePlayer,
            playTimeMs: TIME_MS,
            firstPlayerName: 'tester1',
            secondPlayerName: 'tester2',
        };
        handler.playerHandler.players[0].isTurn = true;
        expect(returnValue).to.eql(expectedServerConfig);
    });

    it('start should call start on player handler', () => {
        handler.start();
        expect(stubPlayerHandler.start.calledOnce).to.be.true;
    });

    it('should remove player', () => {
        handler.removePlayer('0');
        expect(stubPlayerHandler.removePlayer.calledOnce).to.be.true;
    });

    it('endgame should call dispose and add rack to score adjustement', () => {
        const sandbox = createSandbox();
        const stubDispose = sandbox.stub(handler, 'dispose');
        stubReserveHandler.reserve = [];
        handler.playerHandler.players[0].playerData.rack.length = 0;
        handler.endGame();
        expect(handler.playerHandler.players[1].playerData.scoreAdjustment).to.not.eql(0);
        sandbox.assert.calledOnce(stubDispose);
    });

    it('should return stats if players are found', () => {
        const returnValue = handler.getStats('0');
        expect(returnValue).to.be.not.null;
    });

    it('should return null if id is wrong', () => {
        const returnValue = handler.getStats('2');
        expect(returnValue).to.be.null;
    });

    it('should return null if players are not found', () => {
        handler.playerHandler.players = [playerA];
        const returnValue = handler.getStats('2');
        expect(returnValue).to.be.null;
    });

    it('dispose should call dispose on playerHandler', () => {
        handler.dispose();
        expect(stubPlayerHandler.dispose.calledOnce).to.be.true;
    });

    it('timerTick should send message', () => {
        handler.sessionData.timeLimitEpoch = 0;
        handler['timerTick']();
        expect(stubSocketHandler.sendData.calledOnce);
    });

    it('onTurn should call endgame if game is ended', () => {
        stubReserveHandler.reserve = [];
        const sandbox = createSandbox();
        const stubEndGame = sandbox.stub(handler, 'endGame');
        handler['onTurn']('0');
        sandbox.assert.calledOnce(stubEndGame);
    });
    it('onTurn should not call endgame if game is not ended  but fails to find player', () => {
        handler.playerHandler.players[0].playerData.skippedTurns = 0;
        handler.playerHandler.players[1].playerData.skippedTurns = 0;
        handler.reserveHandler.reserve = ['a'];
        const sandbox = createSandbox();
        const stubEndGame = sandbox.stub(handler, 'endGame');
        handler['onTurn']('2');
        sandbox.assert.notCalled(stubEndGame);
    });
    it('onTurn should not call endgame if game is not ended', () => {
        handler.playerHandler.players[0].playerData.skippedTurns = 0;
        handler.playerHandler.players[1].playerData.skippedTurns = 0;
        handler.reserveHandler.reserve = ['a'];
        const sandbox = createSandbox();
        const stubEndGame = sandbox.stub(handler, 'endGame');
        handler['onTurn']('0');
        sandbox.assert.notCalled(stubEndGame);
    });
    it('onTurn call endgame if game is ended cause rackEmptied', () => {
        handler.playerHandler.players[0].playerData.skippedTurns = 0;
        handler.playerHandler.players[1].playerData.skippedTurns = 0;
        handler.reserveHandler.reserve = [];
        handler.playerHandler.players[0].playerData.rack = [];
        handler.playerHandler.players[1].playerData.rack = [];
        const sandbox = createSandbox();
        const stubEndGame = sandbox.stub(handler, 'endGame');
        handler['onTurn']('0');
        sandbox.assert.calledOnce(stubEndGame);
    });
    it('timer from start should call timerTick', () => {
        setTimeout(() => {
            handler.start();
            expect(handler.sessionData.isActive).to.be.true;
        }, Config.SESSION.REFRESH_INTERVAL_MS);
    });
});
