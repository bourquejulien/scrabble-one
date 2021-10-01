import { Injectable } from '@angular/core';
import { PlayerType } from '@app/classes/player-type';
import { Constants } from '@app/constants/global.constants';
import { BoardService } from '@app/services/board/board.service';
import { TimerService } from '@app/services/timer/timer.service';
import { TimeSpan } from '@app/classes/time/timespan';
import { Timer } from '@app/classes/time/timer';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { PlayGeneratorService } from '@app/services/virtual-player/play-generator.service';
import { Subject } from 'rxjs';
const MAX_PLAYTIME_SECONDS = 20;
const MIN_PLAYTIME_SECONDS = 3;

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerService {
    points: number = 0;
    skipTurnNb: number = 0;
    turnComplete: Subject<PlayerType>;
    private rack: string[] = [];
    private minTimer: Timer;
    constructor(
        private readonly playGeneratorService: PlayGeneratorService,
        private readonly reserveService: ReserveService,
        private readonly boardService: BoardService,
        private readonly timerService: TimerService,
    ) {
        this.turnComplete = new Subject<PlayerType>();
        this.minTimer = new Timer(TimeSpan.fromSeconds(MIN_PLAYTIME_SECONDS));
    }

    startTurn() {
        this.timerService.start(TimeSpan.fromSeconds(MAX_PLAYTIME_SECONDS), PlayerType.Virtual);
        this.minTimer.start();
        this.fillRack();

        let random = Math.random();

        if (random < Constants.virtualPlayer.SKIP_PERCENTAGE) {
            this.skipTurn();
            return;
        }
        random -= Constants.virtualPlayer.SKIP_PERCENTAGE;

        if (random < Constants.virtualPlayer.EXCHANGE_PERCENTAGE) {
            this.exchange();
            this.skipTurn();
            this.skipTurnNb = 0;
            return;
        }

        this.play();
        this.skipTurnNb = 0;
        this.endTurn();
    }

    async endTurn() {
        await this.minTimer.completed;

        this.minTimer.stop();
        this.timerService.reset();
        this.turnComplete.next(PlayerType.Virtual);
    }

    skipTurn() {
        if (this.skipTurnNb < 3) {
            this.skipTurnNb++;
        }
        this.endTurn();
    }

    fillRack(): void {
        while (this.reserveService.length > 0 && this.rack.length < Constants.MIN_SIZE) {
            this.rack.push(this.reserveService.drawLetter());
        }
    }

    emptyRack(): void {
        this.rack = [];
    }

    setRack(mockRack: string[]): void {
        this.rack = [];

        for (const letter of mockRack) {
            this.rack.push(letter);
        }
    }

    private exchange() {
        const randomLetterCount = Math.floor(Math.random() * this.rack.length);

        for (let i = 0; i < randomLetterCount; i++) {
            const letterToReplace = Math.floor(Math.random() * this.rack.length);
            const letter = this.rack[letterToReplace];

            this.reserveService.putBackLetter(letter);
            this.rack[letterToReplace] = this.reserveService.drawLetter();
        }
    }

    private async play() {
        const generator = this.playGeneratorService.newGenerator(this.rack);
        const scoreRange = this.getScoreRange();

        while (generator.generateNext() && this.timerService.time.totalMilliseconds > 0);

        const filteredPlays = generator.orderedPlays.filter((e) => e.score >= scoreRange.min && e.score <= scoreRange.max);

        if (filteredPlays.length === 0) {
            return;
        }

        const play = filteredPlays[Math.floor(Math.random() * filteredPlays.length)];

        await this.minTimer.completed;

        this.points += this.boardService.placeLetters(play.letters).points;
        play.letters.forEach((letter) => this.rack.splice(this.rack.findIndex((rackLetter) => letter.letter === rackLetter)));
    }

    private getScoreRange(): { min: number; max: number } {
        let random = Math.random();
        const scoreRanges = Constants.virtualPlayer.SCORE_RANGE;

        for (const scoreRange of scoreRanges) {
            if (random < scoreRange.percentage) {
                return scoreRange.range;
            }
            random -= scoreRange.percentage;
        }

        return { min: 0, max: 0 };
    }

    get length(): number {
        return this.rack.length;
    }

    get rackContent(): string[] {
        return this.rack;
    }
}
