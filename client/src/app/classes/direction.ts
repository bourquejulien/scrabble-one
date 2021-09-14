export enum Direction {
    Left,
    Right,
    Up,
    Down,
    None,
}

export const reverseDirection = (direction: Direction): Direction => {
    switch (direction) {
        case Direction.Down:
            return Direction.Up;
        case Direction.Up:
            return Direction.Down;
        case Direction.Left:
            return Direction.Right;
        case Direction.Right:
            return Direction.Left;
        case Direction.None:
            return Direction.None;
        default:
            return Direction.None;
    }
};
