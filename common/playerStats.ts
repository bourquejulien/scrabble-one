export interface PlayerStats {
    points: number,
    rackSize: number
}

export interface SessionStats {
    localStats: PlayerStats,
    remoteStats: PlayerStats
}
