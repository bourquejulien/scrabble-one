import { Injectable } from '@angular/core';
import { PlayerType } from '@app/classes/player-type';
import { PlayGeneratorService } from '@app/services/virtual-player/play-generator.service';
import { Constants } from '@app/constants/global.constants';
import { Subject } from 'rxjs';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { BoardService } from '@app/services/board/board.service';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerService {
    turnComplete: Subject<PlayerType>;
    private rack: string[] = [];

    constructor(
        private readonly playGeneratorService: PlayGeneratorService,
        private readonly reserveService: ReserveService,
        private readonly boardService: BoardService,
    ) {
        this.turnComplete = new Subject<PlayerType>();
    }

    onTurn() {
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
            return;
        }

        this.play();
        this.skipTurn();
    }

    async skipTurn() {
        const SKIP_TURN_WAIT = 1000;
        await new Promise((resolve) => setTimeout(resolve, SKIP_TURN_WAIT));
        this.turnComplete.next(PlayerType.Virtual);
    }

    exchange() {
        const randomLetterCount = Math.floor(Math.random() * this.rack.length);

        for (let i = 0; i < randomLetterCount; i++) {
            const letterToReplace = Math.floor(Math.random() * this.rack.length);
            const letter = this.rack[letterToReplace];

            this.reserveService.putBackLetter(letter);
            this.rack[letterToReplace] = this.reserveService.drawLetter();
        }
    }

    play() {
        const generator = this.playGeneratorService.newGenerator(this.rack);
        const scoreRange = this.getScoreRange();

        while (generator.generateNext());

        const filteredPlays = generator.orderedPlays.filter((e) => e.score >= scoreRange.min && e.score <= scoreRange.max);

        if (filteredPlays.length === 0) {
            return;
        }

        const play = filteredPlays[Math.floor(Math.random() * filteredPlays.length)];
        this.boardService.placeLetters(play.letters);
        play.letters.forEach((letter) => this.rack.splice(this.rack.findIndex((rackLetter) => letter.letter === rackLetter)));
    }

    fillRack(): void {
        while (this.reserveService.length > 0 && this.rack.length < Constants.reserve.SIZE) {
            this.rack.push(this.reserveService.drawLetter());
        }
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
}
