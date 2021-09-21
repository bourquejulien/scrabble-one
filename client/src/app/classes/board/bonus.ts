export enum Bonus {
    None,
    L2,
    W2,
    L3,
    W3,
    Star,
}

export const getBonusValue = (bonus: Bonus): number => {
    switch (bonus) {
        case Bonus.L2:
            return 2;
        case Bonus.L3:
            return 3;
        case Bonus.W2:
            return 2;
        case Bonus.W3:
            return 3;
        case Bonus.Star:
            return 2;
        default:
            return 1;
    }
};

export const isLetterBonus = (bonus: Bonus): boolean => {
    switch (bonus) {
        case Bonus.L2:
        case Bonus.L3:
            return true;
        case Bonus.W2:
        case Bonus.W3:
        case Bonus.Star:
        default:
            return false;
    }
};
