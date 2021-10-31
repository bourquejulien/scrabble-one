import { Vec2 } from './vec2';

export enum Bonus {
    None = 'None',
    L2 = 'L2',
    W2 = 'W2',
    L3 = 'L3',
    W3 = 'W3',
    Star = 'Star',
}

export interface BonusInfos {
    bonus: Bonus;
    position: Vec2;
}

export interface ScoreData {
    score: number;
    isLetterBonus: boolean;
}

const BONUS_VALUE = new Map<Bonus, ScoreData>([
    [Bonus.L2, { score: 2, isLetterBonus: true }],
    [Bonus.L3, { score: 3, isLetterBonus: true }],
    [Bonus.W2, { score: 2, isLetterBonus: false }],
    [Bonus.W3, { score: 3, isLetterBonus: false }],
    [Bonus.Star, { score: 2, isLetterBonus: false }],
    [Bonus.None, { score: 0, isLetterBonus: false }],
]);

export const getBonusDetails = (bonus: Bonus): ScoreData => BONUS_VALUE.get(bonus)!;
