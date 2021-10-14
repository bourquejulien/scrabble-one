export enum Direction {
    Left,
    Right,
    Up,
    Down,
    None,
}

const REVERSE_DIRECTIONS = new Map<Direction, Direction>([
    [Direction.Down, Direction.Up],
    [Direction.Up, Direction.Down],
    [Direction.Left, Direction.Right],
    [Direction.Right, Direction.Left],
    [Direction.None, Direction.None],
]);

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- All enum values are present in the map
export const reverseDirection = (direction: Direction): Direction => REVERSE_DIRECTIONS.get(direction)!;
