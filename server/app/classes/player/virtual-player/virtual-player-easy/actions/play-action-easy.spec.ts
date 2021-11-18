/* eslint-disable @typescript-eslint/no-unused-expressions,no-unused-expressions,dot-notation */
import { PlayerData } from '@app/classes/player-data';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { Placement } from '@common';
import { expect } from 'chai';
import Sinon, { createSandbox, createStubInstance, SinonSandbox, stub } from 'sinon';
import { PlayActionEasy } from './play-action-easy';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { Play } from '@app/classes/virtual-player/play';
import { Config } from '@app/config';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { PlaceAction } from '@app/classes/player/virtual-player/actions/place-action';
import { SkipAction } from '@app/classes/player/virtual-player/actions/skip-action';

const VALID_PLACEMENT: Placement[] = [
    { letter: 'B', position: { x: 0, y: 0 } },
    { letter: 'a', position: { x: 0, y: 1 } },
    { letter: 'c', position: { x: 0, y: 2 } },
];
const SCORE_RANGE_REPLACEMENT = [
    { percentage: 0, range: { min: 0, max: 6 } },
    { percentage: 0, range: { min: 7, max: 12 } },
    { percentage: 0, range: { min: 13, max: 18 } },
];
const PLAY: Play[] = [{ isSuccess: true, score: 12, placements: [], words: [] }];
const DEFAULT_SCORE_RANGE = { min: 0, max: 0 };
const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

describe('PlayActionEasy', () => {
    let boardHandler: Sinon.SinonStubbedInstance<BoardHandler>;
    let socketHandler: Sinon.SinonStubbedInstance<SocketHandler>;
    let playGeneratorA: Sinon.SinonStubbedInstance<PlayGenerator>;
    let playGeneratorB: Sinon.SinonStubbedInstance<PlayGenerator>;
    let sandboxRandom: SinonSandbox;
    let playerData: PlayerData;
    let action: PlayActionEasy;

    beforeEach(() => {
        socketHandler = createStubInstance(SocketHandler);

        boardHandler = createStubInstance(BoardHandler);
        boardHandler.lookupLetters.returns({ isSuccess: true, score: 0, placements: [], words: [] });
        boardHandler.placeLetters.returns({ isSuccess: false, description: '' });
        boardHandler.retrieveNewLetters.returns(VALID_PLACEMENT);

        playGeneratorA = createStubInstance(PlayGenerator);
        playGeneratorA.generateNext.returns(false);
        playGeneratorB = createStubInstance(PlayGenerator);
        playGeneratorB.generateNext.returns(false);

        playerData = { baseScore: 0, scoreAdjustment: 0, skippedTurns: 0, rack: [] };

        stub(playGeneratorA, 'orderedPlays').get(() => {
            return PLAY;
        });
        stub(playGeneratorB, 'orderedPlays').get(() => {
            return [];
        });

        action = new PlayActionEasy(
            boardHandler as unknown as BoardHandler,
            playGeneratorA as unknown as PlayGenerator,
            playerData,
            socketHandler as unknown as SocketHandler,
        );

        LETTERS.forEach((l) => playerData.rack.push(l));
        sandboxRandom = createSandbox();
    });

    afterEach(() => {
        sandboxRandom.restore();
    });

    it('should create action', () => {
        expect(action).to.be.ok;
    });

    it('should generate play', () => {
        sandboxRandom.stub(Math, 'random').returns(0);
        const returnValue = action.execute();
        expect(returnValue).to.be.not.null;
    });

    it('should not generate play', () => {
        action = new PlayActionEasy(
            boardHandler as unknown as BoardHandler,
            playGeneratorB as unknown as PlayGenerator,
            playerData,
            socketHandler as unknown as SocketHandler,
        );
        const returnValue = action.execute();
        expect(returnValue).to.be.instanceof(SkipAction);
    });

    it('should not generate plays', () => {
        const playGeneratorMock = createStubInstance(PlayGenerator);
        playGeneratorMock.generateNext.returns(false);
        stub(playGeneratorMock, 'orderedPlays').get(() => {
            return [{ isSuccess: true, score: 0, placements: [], words: [] }];
        });
        action = new PlayActionEasy(
            boardHandler as unknown as BoardHandler,
            playGeneratorMock as unknown as PlayGenerator,
            playerData,
            socketHandler as unknown as SocketHandler,
        );
        sandboxRandom.stub(Math, 'random').returns(0);
        const returnValue = action.execute();
        expect(returnValue).to.be.instanceof(PlaceAction);
    });

    it('should return good scoreRange', () => {
        expect(PlayActionEasy['getScoreRange']()).to.not.eql(DEFAULT_SCORE_RANGE);
    });

    it('should return default scoreRange', () => {
        Config.VIRTUAL_PLAYER.SCORE_RANGE = SCORE_RANGE_REPLACEMENT;
        expect(PlayActionEasy['getScoreRange']()).to.eql(DEFAULT_SCORE_RANGE);
    });
});
