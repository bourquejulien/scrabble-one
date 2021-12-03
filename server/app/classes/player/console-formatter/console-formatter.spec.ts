/* eslint-disable @typescript-eslint/no-unused-expressions,no-unused-expressions */
import { expect } from 'chai';
import { Play } from '@app/classes/virtual-player/play';
import { ValidatedWord } from '@app/classes/validation/validation-response';
import { Placement } from '@common';
import { ConsoleFormatter } from '@app/classes/player/console-formatter/console-formatter';

const DEFAULT_SCORE = 10;

const generatePlacements = (count: number): Placement[] => {
    const placements: Placement[] = [];

    for (let i = 0; i < count; i++) {
        const placement: Placement = {
            letter: 'a',
            position: { x: 1, y: 1 },
        };

        placements.push(placement);
    }

    return placements;
};

const generateWord = (count: number): ValidatedWord[] => {
    const words: ValidatedWord[] = [];

    for (let i = 0; i < count; i++) {
        const word: ValidatedWord = {
            score: 1,
            letters: [{ isNew: i % 2 === 0, placement: generatePlacements(1)[0] }],
        };

        words.push(word);
    }

    return words;
};

const generatePlays = (playCount: number, score: number = DEFAULT_SCORE, placementSize: number = 7): Play[] => {
    const plays: Play[] = [];

    for (let i = 0; i < playCount; i++) {
        const play: Play = {
            isSuccess: true,
            score,
            words: generateWord(placementSize),
            placements: generatePlacements(placementSize),
        };

        plays.push(play);
    }

    return plays;
};

describe('Console Formatter', () => {
    it('should format play', () => {
        const expectedEndLine = 8;
        const output = ConsoleFormatter.formatPlay(generatePlays(1)[0]);
        expect(output).to.contain(`(${DEFAULT_SCORE})\n`);

        const endLineCount = output.match(/\n/g)?.length ?? 0;
        expect(endLineCount).eql(expectedEndLine);
    });

    it('should contain 10 plays', () => {
        const PLAY_COUNT = 10;
        const output = ConsoleFormatter.formatPlays(generatePlays(PLAY_COUNT));
        const outputPlayCount = output.match(/\n\n\n/g)?.length ?? 0;
        expect(outputPlayCount).eql(PLAY_COUNT - 1);
    });

    it('should display bingo', () => {
        const output = ConsoleFormatter.formatPlay(generatePlays(1)[0]);
        expect(output).to.contain('Bingo! (50)');
    });
});
