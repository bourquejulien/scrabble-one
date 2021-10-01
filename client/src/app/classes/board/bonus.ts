export enum Bonus {
    None,
    L2,
    W2,
    L3,
    W3,
    Star,
}

const BONUS_VALUE = new Map<Bonus, { score: number; isLetterBonus: boolean }>([
    [Bonus.L2, { score: 2, isLetterBonus: true }],
    [Bonus.L3, { score: 3, isLetterBonus: true }],
    [Bonus.W2, { score: 2, isLetterBonus: false }],
    [Bonus.W3, { score: 3, isLetterBonus: false }],
    [Bonus.Star, { score: 2, isLetterBonus: false }],
    [Bonus.None, { score: 0, isLetterBonus: false }],
]);

export const getBonusDetails = (bonus: Bonus): { score: number; isLetterBonus: boolean } =>
    BONUS_VALUE.get(bonus) ?? { score: 0, isLetterBonus: false };
