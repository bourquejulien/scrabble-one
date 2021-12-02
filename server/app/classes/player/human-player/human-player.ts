import { PlayerInfo } from '@app/classes/player-info';
import { Player } from '@app/classes/player/player';
import { Config } from '@app/config';
import { MessageType, Placement, SystemMessages } from '@common';
import * as logger from 'winston';

export class HumanPlayer extends Player {
    constructor(public playerInfo: PlayerInfo) {
        super(playerInfo);
    }

    async startTurn(): Promise<void> {
        logger.debug(`HumanPlayer - StartTurn - Id: ${this.playerInfo.id}`);

        this.isTurn = true;
        this.socketHandler.sendData('onTurn', this.id);
        return Promise.resolve();
    }

    async placeLetters(placements: Placement[]): Promise<boolean> {
        if (!this.isTurn) {
            return false;
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
            return false;
        }

        const validationData = await this.boardHandler.lookupLetters(placements);
        if (!validationData.isSuccess) {
            this.socketHandler.sendMessage(
                { title: SystemMessages.ImpossibleCommand, body: validationData.description, messageType: MessageType.Error },
                this.id,
            );
            this.endTurn();
            return false;
        }

        this.statsNotifier.notifyPlacement(validationData);

        this.updateRack(lettersToPlace);
        this.fillRack();

        await this.boardHandler.placeLetters(placements);

        this.endTurn();

        this.socketHandler.sendMessage(
            {
                title: SystemMessages.ValidCommand,
                body: 'Lettres placées',
                messageType: MessageType.System,
            },
            this.id,
        );

        return true;
    }

    exchangeLetters(lettersToExchange: string[]): boolean {
        if (!this.isTurn) {
            return false;
        }

        if (!this.areLettersInRack(lettersToExchange)) {
            this.endTurn();
            return false;
        }

        if (this.reserveHandler.length < Config.RACK_SIZE) {
            this.socketHandler.sendMessage(
                {
                    title: SystemMessages.ImpossibleCommand,
                    body: SystemMessages.NotEnoughLetters,
                    messageType: MessageType.Error,
                },
                this.id,
            );
            return false;
        }

        lettersToExchange.forEach(() => this.rack.push(this.reserveHandler.drawLetterFromReserve()));

        for (const letter of lettersToExchange) {
            this.reserveHandler.putBackLetter(letter);
        }

        this.updateRack(lettersToExchange);
        this.statsNotifier.notifyExchange();
        this.endTurn();

        this.socketHandler.sendMessage(
            {
                title: SystemMessages.ValidCommand,
                body: 'Lettres échangées',
                messageType: MessageType.System,
            },
            this.id,
        );

        return true;
    }

    skipTurn(): boolean {
        this.statsNotifier.notifySkip();
        this.endTurn();

        this.socketHandler.sendMessage(
            {
                title: SystemMessages.ValidCommand,
                body: 'Tour sauté',
                messageType: MessageType.System,
            },
            this.id,
        );

        return true;
    }

    fillRack() {
        super.fillRack();
        this.refresh();
    }

    protected endTurn() {
        super.endTurn();
        this.refresh();
    }

    private refresh(): void {
        this.socketHandler.sendData('rack', this.rack, this.id);
    }

    private updateRack(lettersToPlace: string[]): void {
        for (const letter of lettersToPlace) {
            const letterIndex = this.rack.indexOf(letter);
            if (letterIndex === -1) {
                return;
            }
            this.rack.splice(letterIndex, 1);
        }
        this.statsNotifier.notifyRackUpdate(this.rack);
    }

    private areLettersInRack(lettersToPlace: string[]): boolean {
        for (const letter of lettersToPlace) {
            if (this.rack.indexOf(letter) === -1) {
                this.socketHandler.sendMessage(
                    {
                        title: SystemMessages.ImpossibleCommand,
                        body: `${SystemMessages.LetterPossessionError} ${letter}`,
                        messageType: MessageType.Error,
                    },
                    this.id,
                );
                return false;
            }
        }
        return true;
    }
}
