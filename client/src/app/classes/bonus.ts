export enum Bonus {
    None = 'None',
    LetterDouble = 'L2',
    WordDouble = 'W2',
    LetterTriple = 'L3',
    WordTriple = 'W3',
}

export const getBonusValue = (bonus: Bonus): number => {
    switch (bonus) {
        case Bonus.LetterDouble:
            return 2;
        case Bonus.LetterTriple:
            return 3;
        case Bonus.WordDouble:
            return 2;
        case Bonus.WordTriple:
            return 3;
        default:
            return 1;
    }
};

export const isLetterBonus = (bonus: Bonus): boolean => {
    switch (bonus) {
        case Bonus.LetterDouble:
        case Bonus.LetterTriple:
            return true;
        case Bonus.WordDouble:
        case Bonus.WordTriple:
        default:
            return false;
    }
};
