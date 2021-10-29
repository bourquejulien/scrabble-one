import { PlayerData } from '@app/classes/player-data';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { Config } from '@app/config';
import { SkipAction } from '@app/classes/player/virtual-player/actions/skip-action';
import { ExchangeAction } from '@app/classes/player/virtual-player/actions/exchange-action';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { PlayAction } from './actions/play-action';
import { Action } from './actions/action';
import { Observable, Subject } from 'rxjs';
import { Player } from '@app/classes/player/player';
import { PlayerInfo } from '@app/classes/player-info';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import * as logger from 'winston';

const MIN_PLAYTIME_MILLISECONDS = 3000;

export class VirtualPlayer implements Player {
    isTurn: boolean;

    readonly playerData: PlayerData;
    private boardHandler: BoardHandler;
    private reserveHandler: ReserveHandler;
    private socketHandler: SocketHandler;
    private readonly turnEnded: Subject<string>;

    constructor(
        readonly playerInfo: PlayerInfo,
        private readonly dictionaryService: DictionaryService,
        private readonly runAction: (action: Action) => Action | null,
    ) {
        this.playerData = { score: 0, skippedTurns: 0, rack: [] };
        this.turnEnded = new Subject<string>();
    }

    init(boardHandler: BoardHandler, reserveHandler: ReserveHandler, socketHandler: SocketHandler): void {
        this.boardHandler = boardHandler;
        this.reserveHandler = reserveHandler;
        this.socketHandler = socketHandler;
    }

    async startTurn(): Promise<void> {
        logger.debug(`VirtualPlayer - StartTurn - Id: ${this.playerInfo.id}`);

        this.isTurn = true;
        this.socketHandler.sendData('onTurn', this.id);

        await this.delay(MIN_PLAYTIME_MILLISECONDS);

        let action = this.runAction(this.nextAction());
        while (action) {
            action = this.runAction(action);
        }

        this.fillRack();
        this.endTurn();
    }

    fillRack(): void {
        while (this.reserveHandler.length > 0 && this.playerData.rack.length < Config.RACK_SIZE) {
            this.playerData.rack.push(this.reserveHandler.drawLetter());
        }
    }

    onTurn(): Observable<string> {
        return this.turnEnded.asObservable();
    }

    get id(): string {
        return this.playerInfo.id;
    }

    private endTurn(): void {
        this.isTurn = false;
        this.turnEnded.next(this.playerInfo.id);
    }

    private nextAction(): Action {
        let random = Math.random();

        if (random < Config.VIRTUAL_PLAYER.SKIP_PERCENTAGE) {
            return new SkipAction(this.playerData);
        }
        random -= Config.VIRTUAL_PLAYER.SKIP_PERCENTAGE;

        if (random < Config.VIRTUAL_PLAYER.EXCHANGE_PERCENTAGE) {
            return new ExchangeAction(this.reserveHandler, /* this.messaging ,*/ this.playerData);
        }

        const playGenerator = new PlayGenerator(this.dictionaryService, this.boardHandler, this.playerData.rack);

        return new PlayAction(this.boardHandler, playGenerator, this.playerData /* , this.messaging*/);
    }

    private async delay(timeMs: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, timeMs);
        });
    }
}
