export interface LetterData {
    points: number;
    maxQuantity: number;
}

export const letterDefinitions = new Map<string, LetterData>([
    ['A', { points: 1, maxQuantity: 9 }],
    ['B', { points: 3, maxQuantity: 2 }],
    ['c', { points: 3, maxQuantity: 2 }],
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
/*
    {
        letter: 'A',
        points: 1,
        maxQuantity: 9,
    },

    {
        letter: 'B',
        points: 3,
        maxQuantity: 2,
    },

    {
        letter: 'C',
        points: 3,
        maxQuantity: 2,
    },

    {
        letter: 'D',
        points: 2,
        maxQuantity: 3,
    },

    {
        letter: 'E',
        points: 1,
        maxQuantity: 15,
    },

    {
        letter: 'F',
        points: 4,
        maxQuantity: 2,
    },

    {
        letter: 'G',
        points: 2,
        maxQuantity: 2,
    },

    {
        letter: 'H',
        points: 4,
        maxQuantity: 2,
    },

    {
        letter: 'I',
        points: 1,
        maxQuantity: 8,
    },

    {
        letter: 'J',
        points: 8,
        maxQuantity: 1,
    },

    {
        letter: 'K',
        points: 10,
        maxQuantity: 1,
    },

    {
        letter: 'L',
        points: 1,
        maxQuantity: 5,
    },

    {
        letter: 'M',
        points: 2,
        maxQuantity: 3,
    },

    {
        letter: 'N',
        points: 1,
        maxQuantity: 6,
    },

    {
        letter: 'O',
        points: 1,
        maxQuantity: 6,
    },

    {
        letter: 'P',
        points: 3,
        maxQuantity: 2,
    },

    {
        letter: 'Q',
        points: 8,
        maxQuantity: 1,
    },

    {
        letter: 'R',
        points: 1,
        maxQuantity: 6,
    },

    {
        letter: 'S',
        points: 1,
        maxQuantity: 6,
    },

    {
        letter: 'T',
        points: 1,
        maxQuantity: 6,
    },

    {
        letter: 'U',
        points: 1,
        maxQuantity: 6,
    },

    {
        letter: 'V',
        points: 4,
        maxQuantity: 2,
    },

    {
        letter: 'W',
        points: 10,
        maxQuantity: 1,
    },

    {
        letter: 'X',
        points: 10,
        maxQuantity: 1,
    },

    {
        letter: 'Y',
        points: 10,
        maxQuantity: 1,
    },

    {
        letter: 'Z',
        points: 10,
        maxQuantity: 1,
    },

    {
        letter: '*',
        points: 0,
        maxQuantity: 2,
    },
];
