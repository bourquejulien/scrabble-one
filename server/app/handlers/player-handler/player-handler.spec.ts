/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { PlayerData } from '@app/classes/player-data';
import { PlayerInfo } from '@app/classes/player-info';
import { HumanPlayer } from '@app/classes/player/human-player/human-player';
import { Player } from '@app/classes/player/player';
import { VirtualPlayer } from '@app/classes/player/virtual-player/virtual-player';
import { expect } from 'chai';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { createSandbox, createStubInstance } from 'sinon';
import { PlayerHandler } from './player-handler';
const PLAYER_INFO_A: PlayerInfo = { id: '0', name: 'tester1', isHuman: true };
const PLAYER_INFO_B: PlayerInfo = { id: '1', name: 'tester2', isHuman: false };
const PLAYER_DATA_DEFAULT: PlayerData = { baseScore: 0, scoreAdjustment: 0, skippedTurns: 4, rack: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] };
const EXPECTED_NB_PLAYERS = 2;

class PlayerTest {
    onTurn() {
        return new BehaviorSubject(null).asObservable();
    }
}

describe('PlayerHandler', () => {
    let handler = new PlayerHandler();

    beforeEach(() => {
        const turnSubject = new Subject<string>();
        const playerA = createStubInstance(HumanPlayer);
        const playerB = createStubInstance(VirtualPlayer);
        playerA.onTurn.returns(turnSubject.asObservable());
        playerB.onTurn.returns(turnSubject.asObservable());
        playerA.playerInfo = PLAYER_INFO_A;
        playerB.playerInfo = PLAYER_INFO_B;
        playerA.playerData = PLAYER_DATA_DEFAULT;
        playerB.playerData = PLAYER_DATA_DEFAULT;
        playerA.isTurn = true;
        playerB.isTurn = false;
        handler['playerSubscriptions'].set('0', new Subscription());
        handler.addPlayer(playerA as unknown as HumanPlayer);
        handler.addPlayer(playerB as unknown as VirtualPlayer);
    });

    afterEach(() => {
        handler = new PlayerHandler();
    });
    it('should be created', () => {
        expect(handler).to.be.ok;
    });

    it('onTurn should return turnEnded as observable', () => {
        const returnValue = handler.onTurn();
        expect(typeof returnValue).to.eql(typeof new Observable<string>());
    });

    it('add players should add players', () => {
        expect(handler.players.length).to.eql(EXPECTED_NB_PLAYERS);
    });

    it('add players should switchTurn', () => {
        const player = new PlayerTest();
        handler.addPlayer(player as unknown as Player);
    });

    it('remove player should remove specified player', () => {
        handler.removePlayer('0');
        expect(
            handler.players.findIndex((p) => {
                p.id === '0';
            }),
        ).to.eql(-1);
    });

    it('overSkippedLimits should return true if one of the two players is over skipped turns', () => {
        expect(handler.isOverSkipLimit).to.be.true;
    });
    it('rack emptied should return false because both players have filled rack', () => {
        expect(handler.rackEmptied).to.be.false;
    });
    it('dispose should call unsubscribe', () => {
        const map = new Map<string, Subscription>();
        map.set('0', new Subscription());
        map.set('1', new Subscription());
        handler['playerSubscriptions'] = map;
        handler.dispose();
        expect(handler['playerSubscriptions'].get('0')?.closed).to.be.true;
        expect(handler['playerSubscriptions'].get('1')?.closed).to.be.true;
    });
    it('removeplayers should return null if id does not exist', () => {
        expect(handler.removePlayer('2')).to.be.null;
    });
    it('start should call initial turn', () => {
        const sandbox = createSandbox();
        const stubInit = sandbox.stub(handler, 'initialTurn' as any);
        handler.start();
        sandbox.assert.calledOnce(stubInit);
    });
    it('initial Turn should call  switch turn', () => {
        const sandbox = createSandbox();
        const stubSwitch = sandbox.stub(handler, 'switchTurn' as any);
        handler['initialTurn']();
        sandbox.assert.calledOnce(stubSwitch);
    });
    it('switchTurn should call next', () => {
        const sandbox = createSandbox();
        const stubNext = sandbox.stub(handler['nextTurn'], 'next');
        handler['switchTurn']('0');
        sandbox.assert.calledOnce(stubNext);
        sandbox.restore();
    });
    it('removePlayer should unsubscribe playerSubscriptions if needed', () => {
        handler.removePlayer('0');
        expect(
            handler.players.findIndex((p) => {
                p.id === '0';
            }),
        ).to.eql(-1);
    });
    it('switchTurn should call next on nothing if lastId is not valid', () => {
        const sandbox = createSandbox();
        const stubNext = sandbox.stub(handler['nextTurn'], 'next');
        handler.players.length = 0;
        handler['switchTurn']('0');
        sandbox.assert.calledWith(stubNext, '');
    });
    it('should get winning firstplayer', () => {
        const turnSubject = new Subject<string>();
        handler = new PlayerHandler();
        const SCORE = 10;
        const playerA = createStubInstance(HumanPlayer);
        const playerB = createStubInstance(VirtualPlayer);
        playerA.onTurn.returns(turnSubject.asObservable());
        playerB.onTurn.returns(turnSubject.asObservable());
        playerA.playerInfo = PLAYER_INFO_A;
        playerB.playerInfo = PLAYER_INFO_B;
        playerA.playerData = { baseScore: SCORE, scoreAdjustment: 0, skippedTurns: 4, rack: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] };
        playerB.playerData = PLAYER_DATA_DEFAULT;
        handler.addPlayer(playerA as unknown as HumanPlayer);
        handler.addPlayer(playerB as unknown as VirtualPlayer);
        expect(handler.winner).to.eql('0');
    });
    it('should get winning secondplayer', () => {
        const turnSubject = new Subject<string>();
        handler = new PlayerHandler();
        const SCORE = 10;
        const playerA = createStubInstance(HumanPlayer);
        const playerB = createStubInstance(VirtualPlayer);
        playerA.onTurn.returns(turnSubject.asObservable());
        playerB.onTurn.returns(turnSubject.asObservable());
        playerA.playerInfo = PLAYER_INFO_A;
        playerB.playerInfo = PLAYER_INFO_B;
        playerB.playerData = { baseScore: SCORE, scoreAdjustment: 0, skippedTurns: 4, rack: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] };
        playerA.playerData = PLAYER_DATA_DEFAULT;
        handler.addPlayer(playerA as unknown as HumanPlayer);
        handler.addPlayer(playerB as unknown as VirtualPlayer);
        expect(handler.winner).to.eql('1');
    });
});
