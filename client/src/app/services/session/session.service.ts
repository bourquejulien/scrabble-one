import { Injectable } from '@angular/core';
import { GameConfig } from '@app/classes/game-config';
import { TimeSpan } from '@app/classes/time/timespan';
import { GameType, ServerConfig } from '@common';

@Injectable({
    providedIn: 'root',
})
export class SessionService {
    private _id: string;
    private _gameConfig: GameConfig;

    constructor() {
        this.reset();
    }

    private reset() {
        this._id = '';
        this._gameConfig = {
            gameType: GameType.SinglePlayer,
            playTime: TimeSpan.fromMinutesSeconds(1, 0),
            firstPlayerName: '',
            secondPlayerName: '',
        };
    }

    set serverConfig(config: ServerConfig) {
        this._id = config.id;
        this._gameConfig = {
            gameType: config.gameType,
            playTime: TimeSpan.fromMilliseconds(config.playTimeMs),
            firstPlayerName: config.firstPlayerName,
            secondPlayerName: config.secondPlayerName,
        };
    }

    get gameConfig(): GameConfig {
        return this._gameConfig;
    }

    get id(): string {
        return this._id;
    }
}
