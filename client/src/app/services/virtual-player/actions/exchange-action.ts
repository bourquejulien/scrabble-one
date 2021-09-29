import { ReserveService } from '@app/services/reserve/reserve.service';
import { Action } from './action';

export class ExchangeAction implements Action {
    constructor(private readonly reserveService: ReserveService, private readonly rack: string[]) {}

    execute(): Action | null {
        const randomLetterCount = Math.floor(Math.random() * this.rack.length);

        for (let i = 0; i < randomLetterCount; i++) {
            const letterToReplace = Math.floor(Math.random() * this.rack.length);
            const letter = this.rack[letterToReplace];

            this.reserveService.putBackLetter(letter);
            this.rack[letterToReplace] = this.reserveService.drawLetter();
        }

        return null;
    }
}
