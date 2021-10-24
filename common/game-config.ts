export interface VirtualGameConfig {
    gameType: '',
    playTimeMs: number,
    firstPlayerName: '',
    virtualPlayerName: '',
}

export interface ServerGameConfig {
    id: string,
    gameType: string,
    playTimeMs: number,
    firstPlayerName: string,
    secondPlayerName: string,
}
