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
import { BehaviorSubject, Observable } from 'rxjs';
import { Player } from '@app/classes/player/player';
import { PlayerInfo } from '@app/classes/player-info';

const MIN_PLAYTIME_MILLISECONDS = 3000;

export class VirtualPlayer implements Player {
    isTurn: boolean;
    readonly playerData: PlayerData;
    private readonly turnEnded: BehaviorSubject<string>;

    constructor(
        readonly playerInfo: PlayerInfo,
        private readonly dictionaryService: DictionaryService,
        private readonly boardHandler: BoardHandler,
        private readonly reserve: ReserveHandler,
        private readonly runAction: (action: Action) => Action | null,
    ) {
        this.playerData = { score: 0, skippedTurns: 0, rack: [] };
        this.turnEnded = new BehaviorSubject<string>(this.playerInfo.id);
    }

    async startTurn(): Promise<void> {
        this.isTurn = true;

        await this.delay(MIN_PLAYTIME_MILLISECONDS);

        let action = this.runAction(this.nextAction());
        while (action) {
            action = this.runAction(action);
        }

        this.fillRack();
        this.endTurn();
    }

    fillRack(): void {
        while (this.reserve.length > 0 && this.playerData.rack.length < Config.RACK_SIZE) {
            this.playerData.rack.push(this.reserve.drawLetter());
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
            return new ExchangeAction(this.reserve, /* this.messaging ,*/ this.playerData);
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
