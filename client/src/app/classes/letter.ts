export interface LetterData {
    points: number;
    maxQuantity: number;
}

export const letterDefinitions = new Map<string, LetterData>([
    ['a', { points: 1, maxQuantity: 9 }],
    ['b', { points: 3, maxQuantity: 2 }],
    ['c', { points: 3, maxQuantity: 2 }],
    ['d', { points: 2, maxQuantity: 3 }],
    ['e', { points: 1, maxQuantity: 15 }],
    ['f', { points: 4, maxQuantity: 2 }],
    ['g', { points: 2, maxQuantity: 2 }],
    ['h', { points: 4, maxQuantity: 2 }],
    ['i', { points: 1, maxQuantity: 8 }],
    ['j', { points: 8, maxQuantity: 1 }],
    ['k', { points: 10, maxQuantity: 1 }],
    ['l', { points: 1, maxQuantity: 5 }],
    ['m', { points: 2, maxQuantity: 3 }],
    ['n', { points: 1, maxQuantity: 6 }],
    ['o', { points: 1, maxQuantity: 6 }],
    ['p', { points: 3, maxQuantity: 2 }],
    ['q', { points: 8, maxQuantity: 1 }],
    ['r', { points: 1, maxQuantity: 6 }],
    ['s', { points: 1, maxQuantity: 6 }],
    ['t', { points: 1, maxQuantity: 6 }],
    ['u', { points: 1, maxQuantity: 6 }],
    ['v', { points: 4, maxQuantity: 2 }],
    ['w', { points: 10, maxQuantity: 1 }],
    ['x', { points: 10, maxQuantity: 1 }],
    ['y', { points: 10, maxQuantity: 1 }],
    ['z', { points: 10, maxQuantity: 1 }],
    ['*', { points: 0, maxQuantity: 2 }],
]);
