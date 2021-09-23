import { Injectable } from '@angular/core';
import { PlayerType } from '@app/classes/player-type';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { Constants } from '@app/constants/global.constants';
import { Subject } from 'rxjs';
import { BoardService } from './board/board.service';
import { DictionaryService } from './dictionary/dictionary.service';
import { ReserveService } from './reserve/reserve.service';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerService {
    turnComplete: Subject<PlayerType>;
    private rack: string[] = [];

    constructor(
        private readonly boardService: BoardService,
        private readonly reserveService: ReserveService,
        private readonly dictionaryService: DictionaryService,
    ) {
        this.turnComplete = new Subject<PlayerType>();
    }

    onTurn() {
        this.fillRack();

        // const random = Math.random();
        this.skipTurn();

        // if (random < Constants.virtualPlayer.SKIP_PERCENTAGE) {
        //     random -= Constants.virtualPlayer.SKIP_PERCENTAGE;
        //     this.skipTurn();
        //     return;
        // }

        // if (random < Constants.virtualPlayer.EXCHANGE_PERCENTAGE) {
        //     this.exchange();
        //     return;
        // }

        // this.turnComplete.next(PlayerType.Virtual);
        // this.play();
    }

    async skipTurn() {
        await new Promise(resolve => setTimeout(resolve, 1000));
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
        const generator = new PlayGenerator(this.boardService.gameBoard.clone(), this.dictionaryService, this.boardService, this.rack);
        const scoreRange = this.getScoreRange();

        while (generator.orderedPlays.length < 3) {
            generator.generateNext();
        }

        const filteredPlays = generator.orderedPlays.filter((e) => e.score >= scoreRange.min && e.score <= scoreRange.max);
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
