export interface LetterData {
    points: number;
    maxQuantity: number;
}

export const letterDefinitions = new Map<string, LetterData>([
    ['A', { points: 1, maxQuantity: 9 }],
    ['B', { points: 3, maxQuantity: 2 }],
    ['C', { points: 3, maxQuantity: 2 }],
    ['D', { points: 2, maxQuantity: 3 }],
    ['E', { points: 1, maxQuantity: 15 }],
    ['F', { points: 4, maxQuantity: 2 }],
    ['G', { points: 2, maxQuantity: 2 }],
    ['H', { points: 4, maxQuantity: 2 }],
    ['I', { points: 1, maxQuantity: 8 }],
    ['J', { points: 8, maxQuantity: 1 }],
    ['K', { points: 10, maxQuantity: 1 }],
    ['L', { points: 1, maxQuantity: 5 }],
    ['M', { points: 2, maxQuantity: 3 }],
    ['N', { points: 1, maxQuantity: 6 }],
    ['O', { points: 1, maxQuantity: 6 }],
    ['P', { points: 3, maxQuantity: 2 }],
    ['Q', { points: 8, maxQuantity: 1 }],
    ['R', { points: 1, maxQuantity: 6 }],
    ['S', { points: 1, maxQuantity: 6 }],
    ['T', { points: 1, maxQuantity: 6 }],
    ['U', { points: 1, maxQuantity: 6 }],
    ['V', { points: 4, maxQuantity: 2 }],
    ['W', { points: 10, maxQuantity: 1 }],
    ['X', { points: 10, maxQuantity: 1 }],
    ['Y', { points: 10, maxQuantity: 1 }],
    ['Z', { points: 10, maxQuantity: 1 }],
    ['*', { points: 0, maxQuantity: 2 }],
]);
