import { Goal } from '@app/classes/goal/base-goal';
import { PlaceCorner } from '@app/classes/goal/goals/place-corner/place-corner';
import { ManyLettersInRow } from '@app/classes/goal/goals/many-letters-in-row/many-letters-in-row';
import { PlaceOnBorder } from '@app/classes/goal/goals/place-on-border/place-on-border';
import { PlacePalindrome } from '@app/classes/goal/goals/place-palindrome/place-palindrome';
import { PlaceLetterTwice } from '@app/classes/goal/goals/place-letter-twice/place-letter-twice';
import { PlaceLongWord } from '@app/classes/goal/goals/place-long-word/place-long-word';
import { ShortWordHighScore } from '@app/classes/goal/goals/short-word-high-score/short-word-high-score';
import { BingoWithoutExchange } from '@app/classes/goal/goals/bingo-without-exchange/bingo-without-exchange';

export type GoalGenerator = { generate(ownerId: string): Goal };

export const GOAL_GENERATORS: GoalGenerator[] = [
    PlaceCorner,
    PlaceLetterTwice,
    PlaceLongWord,
    ManyLettersInRow,
    PlaceOnBorder,
    PlacePalindrome,
    ShortWordHighScore,
    BingoWithoutExchange,
];
