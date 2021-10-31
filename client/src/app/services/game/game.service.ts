import { Injectable } from '@angular/core';
import { PlayerService } from '@app/services/player/player.service';
import { GameType, ServerConfig, SessionStats, SinglePlayerConfig } from '@common';
import { BehaviorSubject, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '@app/services/session/session.service';
import { PlayerType } from '@app/classes/player/player-type';
import { environmentExt } from '@environmentExt';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';

const localUrl = (base: string, call: string, id?: string) => `${environmentExt.apiUrl}${base}/${call}${id ? '/' + id : ''}`;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    stats: SessionStats;
    currentTurn: PlayerType = PlayerType.Local;
    onTurn: BehaviorSubject<PlayerType>;
    gameEnding: Subject<void>;

    private gameRunning: boolean = false;

    constructor(
        private readonly playerService: PlayerService,
        private readonly httpCLient: HttpClient,
        private readonly sessionService: SessionService,
        private readonly socketService: SocketClientService,
    ) {
        this.stats = {
            localStats: { points: 0, rackSize: 0 },
            remoteStats: { points: 0, rackSize: 0 },
        };

        this.onTurn = new BehaviorSubject<PlayerType>(PlayerType.Local);
        this.gameEnding = new Subject<void>();
    }

    async startSinglePlayer(config: SinglePlayerConfig): Promise<void> {
        const serverConfig = await this.httpCLient.put<ServerConfig>(localUrl('game', 'init/single'), config).toPromise();
        this.socketService.join(serverConfig.id);

        const startId = await this.httpCLient.get<string>(localUrl('game', 'start', serverConfig.id)).toPromise();
        await this.start(serverConfig, startId);
    }

    async start(serverConfig: ServerConfig, startId: string): Promise<void> {
        this.sessionService.serverConfig = serverConfig;

        this.socketService.on('onTurn', (id: string) => {
            this.onNextTurn(id);
        });

        this.socketService.on('endGame', async () => {
            await this.refresh();
            this.gameEnding.next();
        });

        await this.refresh();
        this.gameRunning = true;
        this.onNextTurn(startId);
    }

    async reset() {
        this.gameRunning = false;
        this.playerService.reset();
        this.socketService.reset();

        await this.httpCLient.delete(localUrl('game', 'stop', this.sessionService.id)).toPromise();
    }

    private async onNextTurn(id: string): Promise<void> {
        if (!this.gameRunning) return;

        let playerType: PlayerType;

        if (id === this.sessionService.id) {
            playerType = PlayerType.Local;
        } else {
            playerType = this.sessionService.gameConfig.gameType === GameType.SinglePlayer ? PlayerType.Virtual : PlayerType.Remote;
        }

        if (this.currentTurn === playerType) {
            return;
        }

        await this.refresh();

        this.currentTurn = playerType;
        this.onTurn.next(this.currentTurn);
    }

    private async refresh(): Promise<void> {
        this.stats = await this.httpCLient.get<SessionStats>(localUrl('player', 'stats', this.sessionService.id)).toPromise();
        await this.playerService.refresh();
    }
}
