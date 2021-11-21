import { Goal } from '@app/classes/goal/base-goal';
import { PlaceCorner } from '@app/classes/goal/goals/place-corner/place-corner';
import { PlaceLetterTwice } from '@app/classes/goal/goals/place-letter-twice/place-letter-twice';
import { PlaceLongWord } from '@app/classes/goal/goals/place-long-word/place-long-word';
import { ManyLettersInRow } from '@app/classes/goal/goals/place-many-3-in-row/many-letters-in-row';
import { PlaceOnBorder } from '@app/classes/goal/goals/place-on-border/place-on-border';
import { PlacePalindrome } from '@app/classes/goal/goals/place-palindrome/place-palindrome';
import { ShortWordHighScore } from '@app/classes/goal/goals/short-word-over-15/short-word-high-score';

export type GoalGenerator = { generate(ownerId: string): Goal };

export const GOAL_GENERATORS: GoalGenerator[] = [
    PlaceCorner,
    PlaceLetterTwice,
    PlaceLongWord,
    ManyLettersInRow,
    PlaceOnBorder,
    PlacePalindrome,
    ShortWordHighScore,
];
