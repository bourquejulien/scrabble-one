import { IPlayer } from '@app/classes/player/player';
import { PlayerInfo } from '@app/classes/player-info';
import { PlayerData } from '@app/classes/player-data';
import { BehaviorSubject } from 'rxjs';
import { Config } from '@app/config';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { Placement, Answer } from '@common';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';

// TODO Fix messaging service: over sockets, or in Answer?
export class HumanPlayer implements IPlayer {
    playerData: PlayerData;
    readonly turnEnded: BehaviorSubject<string>;

    constructor(readonly playerInfo: PlayerInfo, private readonly boardHandler: BoardHandler, private readonly reserveHandler: ReserveHandler) {
        this.playerData = { score: 0, skippedTurns: 0, rack: [] };
        this.turnEnded = new BehaviorSubject<string>(this.playerInfo.id);
    }

    async startTurn(): Promise<void> {
        return Promise.resolve();
    }

    endTurn(): void {
        this.turnEnded.next(this.playerInfo.id);
    }

    fillRack(): void {
        while (this.reserveHandler.length > 0 && this.playerData.rack.length < Config.RACK_SIZE) {
            this.playerData.rack.push(this.reserveHandler.drawLetter());
        }
    }

    async placeLetters(placements: Placement[]): Promise<Answer> {
        const lettersToPlace: string[] = [];

        placements = this.boardHandler.retrieveNewLetters(placements);

        for (const item of placements) {
            let letter = item.letter;

            if (letter[0].match(/^[A-Z]$/)) {
                item.letter = letter.toLowerCase();
                letter = '*';
            }

            lettersToPlace.push(letter);
        }

        if (!this.areLettersInRack(lettersToPlace)) {
            this.endTurn();
            return { isSuccess: false, body: 'Letters not in rack' };
        }

        const validationData = await this.boardHandler.lookupLetters(placements);
        if (!validationData.isSuccess) {
            /* this.messagingService.send('', validationData.description, MessageType.Log); */
            this.endTurn();
            return { isSuccess: false, body: 'Validation failed' };
        }

        this.playerData.score += validationData.points;

        this.updateRack(lettersToPlace);
        this.fillRack();

        await this.boardHandler.placeLetters(placements);

        this.playerData.skippedTurns = 0;
        this.endTurn();

        return { isSuccess: true, body: '' };
    }

    exchangeLetters(lettersToExchange: string[]): Answer {
        if (!this.areLettersInRack(lettersToExchange)) return { isSuccess: false, body: 'Letters not in rack' };

        if (this.reserveHandler.length < Config.RACK_SIZE) {
            /* this.messagingService.send(SystemMessages.ImpossibleAction, SystemMessages.NotEnoughLetters, MessageType.Error); */
            return { isSuccess: false, body: 'Letters not in rack' };
        }

        lettersToExchange.forEach(() => {
            this.playerData.rack.push(this.reserveHandler.drawLetter());
        });

        for (const letter of lettersToExchange) {
            this.reserveHandler.putBackLetter(letter);
        }

        this.updateRack(lettersToExchange);
        this.playerData.skippedTurns = 0;
        this.endTurn();

        return { isSuccess: true, body: '' };
    }

    skipTurn(): Answer {
        this.playerData.skippedTurns++;
        this.endTurn();

        return { isSuccess: true, body: '' };
    }

    get id(): string {
        return this.playerInfo.id;
    }

    private updateRack(lettersToPlace: string[]): void {
        for (const letter of lettersToPlace) {
            const letterIndex = this.playerData.rack.indexOf(letter);
            if (letterIndex === -1) return;
            this.playerData.rack.splice(letterIndex, 1);
        }
    }

    private areLettersInRack(lettersToPlace: string[]): boolean {
        for (const letter of lettersToPlace) {
            if (this.playerData.rack.indexOf(letter) === -1) {
                /* this.messagingService.send(SystemMessages.ImpossibleAction, SystemMessages.LetterPossessionError + letter, MessageType.Error); */
                return false;
            }
        }
        return true;
    }
}
