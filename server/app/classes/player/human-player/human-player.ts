import { Player } from '@app/classes/player/player';
import { PlayerInfo } from '@app/classes/player-info';
import { PlayerData } from '@app/classes/player-data';
import { Config } from '@app/config';
import { Answer, Placement } from '@common';
import * as logger from 'winston';

export class HumanPlayer extends Player {
    isTurn: boolean;
    readonly playerData: PlayerData;

    constructor(readonly playerInfo: PlayerInfo) {
        super();
    }

    async startTurn(): Promise<void> {
        logger.debug(`HumanPlayer - StartTurn - Id: ${this.playerInfo.id}`);

        this.isTurn = true;
        this.socketHandler.sendData('onTurn', this.id);
        return Promise.resolve();
    }

    async placeLetters(placements: Placement[]): Promise<Answer> {
        if (!this.isTurn) {
            return { isSuccess: false, body: 'Not your turn' };
        }

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

        this.playerData.baseScore += validationData.points;

        this.updateRack(lettersToPlace);
        this.fillRack();

        await this.boardHandler.placeLetters(placements);

        this.playerData.skippedTurns = 0;
        this.endTurn();

        return { isSuccess: true, body: '' };
    }

    exchangeLetters(lettersToExchange: string[]): Answer {
        if (!this.isTurn) {
            return { isSuccess: false, body: 'Not your turn' };
        }
        if (this.reserveHandler.length < Config.RACK_SIZE) {
            // this.socketService.send(SystemMessages.ImpossibleAction, SystemMessages.NotEnoughLetters, MessageType.Error);
            return { isSuccess: false, body: 'Letters not in rack' };
        }
        if (!this.areLettersInRack(lettersToExchange)) return { isSuccess: false, body: 'Letters not in rack' };

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

    private updateRack(lettersToPlace: string[]): void {
        for (const letter of lettersToPlace) {
            const letterIndex = this.playerData.rack.indexOf(letter);
            if (letterIndex === -1) {
                return;
            }
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
