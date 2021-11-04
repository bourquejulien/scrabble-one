import { Injectable } from '@angular/core';
import { PlayerService } from '@app/services/player/player.service';
import { GameType, ServerConfig, SessionStats, SinglePlayerConfig } from '@common';
import { BehaviorSubject, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '@app/services/session/session.service';
import { PlayerType } from '@app/classes/player/player-type';
import { environmentExt } from '@environment-ext';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { EndGameWinner } from '@app/classes/end-game-winner';

const localUrl = (base: string, call: string, id?: string) => `${environmentExt.apiUrl}${base}/${call}${id ? '/' + id : ''}`;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    stats: SessionStats;
    currentTurn: PlayerType = PlayerType.Local;
    onTurn: BehaviorSubject<PlayerType>;
    gameEnding: Subject<EndGameWinner>;

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
        this.gameEnding = new Subject<EndGameWinner>();

        this.socketService.on('onTurn', async (id: string) => this.onNextTurn(id));
        this.socketService.on('endGame', async (winnerId: string) => this.endGame(winnerId));
    }

    async startSinglePlayer(config: SinglePlayerConfig): Promise<void> {
        const serverConfig = await this.httpCLient.put<ServerConfig>(localUrl('game', 'init/single'), config).toPromise();
        await this.start(serverConfig);
    }

    async start(serverConfig: ServerConfig): Promise<void> {
        this.socketService.join(serverConfig.id);
        this.sessionService.serverConfig = serverConfig;

        await this.refresh();
        this.gameRunning = true;
        this.onNextTurn(serverConfig.startId);
    }

    async reset() {
        this.gameRunning = false;
        this.playerService.reset();
        this.socketService.reset();
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

    private async endGame(winnerId: string) {
        let winner: EndGameWinner;

        if (winnerId === '') {
            winner = EndGameWinner.Draw;
        } else {
            winner = winnerId === this.sessionService.id ? EndGameWinner.Local : EndGameWinner.Remote;
        }

        await this.refresh();
        this.gameEnding.next(winner);
    }

    private async refresh(): Promise<void> {
        // TODO Add try catch ?
        this.stats = await this.httpCLient.get<SessionStats>(localUrl('player', 'stats', this.sessionService.id)).toPromise();
        await this.playerService.refresh();
    }
}
