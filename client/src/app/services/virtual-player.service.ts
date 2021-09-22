import { Injectable } from '@angular/core';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { Constants } from '@app/constants/global.constants';
import { BoardService } from './board.service';
import { DictionaryService } from './dictionary.service';
import { ReserveService } from './reserve.service';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerService {
    private rack: string[];
    constructor(
        private readonly boardService: BoardService,
        private readonly reserveService: ReserveService,
        private readonly dictionaryService: DictionaryService,
    ) {}

    onTurn() {
        this.fillRack();

        let random = Math.random();

        if (random < 0.1) {
            random -= 0.1;
            this.skipTurn();
            return;
        }

        if (random < 0.1) {
            this.exchange();
            return;
        }

        this.play();
    }

    private skipTurn() {}

    private exchange() {
        const randomLetterCount = Math.floor(Math.random() * this.rack.length);

        for (let i = 0; i < randomLetterCount; i++) {
            const letterToReplace = Math.floor(Math.random() * this.rack.length);
            const letter = this.rack[letterToReplace];

            this.reserveService.putBackLetter(letter);
            this.rack[letterToReplace] = this.reserveService.drawLetter();
        }
    }

    private play() {
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

    private fillRack(): void {
        while (this.reserveService.length > 0 && this.rack.length < Constants.reserve.SIZE) {
            this.rack.push(this.reserveService.drawLetter());
        }
    }

    private getScoreRange(): { min: number; max: number } {
        let random = Math.random();

        if (random < 0.4) {
            random -= 0.4;
            return { min: 0, max: 6 };
        }

        if (random < 0.3) {
            return { min: 7, max: 12 };
        }

        return { min: 13, max: 18 };
    }
}
