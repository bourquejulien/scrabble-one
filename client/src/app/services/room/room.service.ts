import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { MultiplayerCreateConfig, MultiplayerJoinConfig, ServerConfig, ConvertConfig, AvailableGameConfig } from '@common';
import { environmentExt } from '@environmentExt';
import { HttpClient } from '@angular/common/http';
import { GameService } from '@app/services/game/game.service';
import { Observable, Subject } from 'rxjs';
import { Constants } from '@app/constants/global.constants';

const localUrl = (base: string, call: string, id?: string) => `${environmentExt.apiUrl}${base}/${call}${id ? '/' + id : ''}`;

@Injectable({
    providedIn: 'root',
})
export class RoomService {
    private availableRooms: AvailableGameConfig[];
    private readonly hasJoined: Subject<ServerConfig>;

    private pendingRoomId: string;

    constructor(
        private readonly socketService: SocketClientService,
        private readonly gameService: GameService,
        private readonly httpCLient: HttpClient,
    ) {
        this.availableRooms = [];
        this.hasJoined = new Subject<ServerConfig>();
        this.pendingRoomId = '';

        this.socketService.on('availableRooms', (rooms: AvailableGameConfig[]) => (this.availableRooms = rooms));
        this.socketService.on('onJoin', async (serverConfig: ServerConfig) => this.onTurn(serverConfig));
    }

    init(): void {
        this.pendingRoomId = '';
    }

    async create(createConfig: MultiplayerCreateConfig): Promise<void> {
        const id = await this.httpCLient.put<string>(localUrl('game', 'init/multi'), createConfig).toPromise();
        this.socketService.join(id);

        this.pendingRoomId = id;
    }

    async abort(): Promise<void> {
        if (this.pendingRoomId === '') {
            return;
        }

        this.socketService.reset();
        this.pendingRoomId = '';
    }

    async toSinglePlayer(): Promise<void> {
        if (this.pendingRoomId == null) {
            return;
        }

        const config: ConvertConfig = {
            id: this.pendingRoomId,
            virtualPlayerName: Constants.BOT_NAMES[Math.floor(Constants.BOT_NAMES.length * Math.random())],
        };

        const serverConfig = await this.httpCLient.put<ServerConfig>(localUrl('game', 'convert'), config).toPromise();
        await this.onTurn(serverConfig);
    }

    async join(id: string): Promise<void> {
        const joinConfig: MultiplayerJoinConfig = {
            sessionId: id,
            playerName: 'test', // TODO
        };

        const serverConfig = await this.httpCLient.put<ServerConfig>(localUrl('game', 'join'), joinConfig).toPromise();
        this.socketService.join(serverConfig.id);
        await this.gameService.start(serverConfig);
    }

    refresh(): void {
        this.socketService.send('getRooms');
    }

    get rooms(): AvailableGameConfig[] {
        return this.availableRooms;
    }

    get onGameFull(): Observable<ServerConfig> {
        return this.hasJoined.asObservable();
    }

    private async onTurn(serverConfig: ServerConfig): Promise<void> {
        if (this.pendingRoomId === '') {
            return;
        }

        await this.gameService.start(serverConfig);
        this.hasJoined.next(serverConfig);
        this.pendingRoomId = '';
    }
}
