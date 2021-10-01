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

export const reverseDirection = (direction: Direction): Direction => REVERSE_DIRECTIONS.get(direction) ?? Direction.None;
