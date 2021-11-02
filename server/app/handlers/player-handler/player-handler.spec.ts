/* eslint-disable max-classes-per-file */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { PlayerData } from '@app/classes/player-data';
import { PlayerInfo } from '@app/classes/player-info';
import { HumanPlayer } from '@app/classes/player/human-player/human-player';
import { Action } from '@app/classes/player/virtual-player/actions/action';
import { VirtualPlayer } from '@app/classes/player/virtual-player/virtual-player';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { expect } from 'chai';
import { Observable, Subscription } from 'rxjs';
import { createStubInstance } from 'sinon';
import { PlayerHandler } from './player-handler';
const PLAYER_INFO_A: PlayerInfo = { id: '0', name: 'tester1', isHuman: true };
const PLAYER_INFO_B: PlayerInfo = { id: '1', name: 'tester2', isHuman: false };
const PLAYER_DATA_DEFAULT: PlayerData = { baseScore: 0, scoreAdjustment: 0, skippedTurns: 4, rack: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] };
const EXPECTED_NB_PLAYERS = 2;

export class HumanPlayerMock extends HumanPlayer {
    fillRack() {
        // Does nothing
    }
}

export class VirtualPlayerMock extends VirtualPlayer {
    fillRack() {
        // Does nothing
    }
}
describe('PlayerHandler', () => {
    let handler = new PlayerHandler();
    const dictionaryService = createStubInstance(DictionaryService) as unknown as DictionaryService;
    const runAction: (action: Action) => Action | null = () => null;
    beforeEach(() => {
        const playerA = new HumanPlayerMock(PLAYER_INFO_A);
        const playerB = new VirtualPlayerMock(PLAYER_INFO_B, dictionaryService, runAction);
        playerA.playerData = PLAYER_DATA_DEFAULT;
        playerB.playerData = PLAYER_DATA_DEFAULT;
        playerA.isTurn = true;
        playerB.isTurn = false;
        handler.addPlayer(playerA);
        handler.addPlayer(playerB);
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

    it('remove player should remove specified player', () => {
        handler.removePlayer('0');
        expect(
            handler.players.findIndex((p) => {
                p.id === '0';
            }),
        ).to.eql(-1);
    });

    it('start should return the player id that is playing', () => {
        const returnValue = handler.start();
        expect(returnValue).to.eql('0');
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
    it('start should return nothing if no one is playing', () => {
        handler = new PlayerHandler();
        const playerA = new HumanPlayerMock(PLAYER_INFO_A);
        const playerB = new VirtualPlayerMock(PLAYER_INFO_B, dictionaryService, runAction);
        playerA.playerData = PLAYER_DATA_DEFAULT;
        playerB.playerData = PLAYER_DATA_DEFAULT;
        playerA.isTurn = false;
        playerB.isTurn = false;
        handler.addPlayer(playerA);
        handler.addPlayer(playerB);
        expect(handler.start()).to.eql('');
    });
    it('removeplayers should return null if id does not exist', () => {
        expect(handler.removePlayer('2')).to.be.null;
    });
});
