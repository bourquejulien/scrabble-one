/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { PlayerData } from '@app/classes/player-data';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { Placement } from '@common';
import { expect } from 'chai';
import { createSandbox, createStubInstance, SinonSandbox, stub } from 'sinon';
import { PlayAction } from './play-action';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { Play } from '@app/classes/virtual-player/play';
import { Config } from '@app/config';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';

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
const PLAY: Play[] = [{ score: 0, word: 'bac', letters: VALID_PLACEMENT }];
const DEFAULT_SCORE_RANGE = { min: 0, max: 0 };
const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
/* eslint-disable dot-notation */
describe('Play Action', () => {
    // const board = new Board(SIZE);
    // const boardValidator = createStubInstance(BoardValidator) as unknown as BoardValidator;
    const boardHandler = createStubInstance(BoardHandler);
    const socketHandler = createStubInstance(SocketHandler);
    boardHandler.lookupLetters.returns({ isSuccess: true, points: 0, description: '' });
    boardHandler.placeLetters.returns({ isSuccess: false, points: 0, description: '' });
    boardHandler.retrieveNewLetters.returns(VALID_PLACEMENT);
    const playGeneratorA = createStubInstance(PlayGenerator);
    playGeneratorA.generateNext.returns(false);
    let sandboxRandom: SinonSandbox;
    stub(playGeneratorA, 'orderedPlays').get(() => {
        return PLAY;
    });
    const playerData: PlayerData = { baseScore: 0, scoreAdjustment: 0, skippedTurns: 0, rack: [] };
    const action = new PlayAction(
        boardHandler as unknown as BoardHandler,
        playGeneratorA as unknown as PlayGenerator,
        playerData,
        socketHandler as unknown as SocketHandler,
    );
    beforeEach(() => {
        LETTERS.forEach((l) => playerData.rack.push(l));
        sandboxRandom = createSandbox();
    });

    afterEach(() => {
        sandboxRandom.restore();
    });

    it('should create action', () => {
        expect(action).to.be.ok;
    });
    /*
    it('should generate play', () => {
        sandboxRandom.stub(Math, 'random').returns(0);
        const returnValue = action.execute();
        expect(returnValue).to.be.not.null;
    });

    it('should not generate plays', () => {
        const playGeneratorMock = createStubInstance(PlayGenerator);
        playGeneratorMock.generateNext.returns(false);
        stub(playGeneratorMock, 'orderedPlays').get(() => {
            return [];
        });
        action = new PlayAction(
            boardHandler as unknown as BoardHandler,
            playGeneratorA as unknown as PlayGenerator,
            playerData,
            socketHandler as unknown as SocketHandler,
        );
        sandboxRandom.stub(Math, 'random').returns(0);
        const returnValue = action.execute();
        expect(returnValue).to.be.null;
    });
    */
    it('should return good scoreRange', () => {
        expect(PlayAction['getScoreRange']()).to.not.eql(DEFAULT_SCORE_RANGE);
    });
    it('should return default scoreRange', () => {
        Config.VIRTUAL_PLAYER.SCORE_RANGE = SCORE_RANGE_REPLACEMENT;
        expect(PlayAction['getScoreRange']()).to.eql(DEFAULT_SCORE_RANGE);
    });
});
