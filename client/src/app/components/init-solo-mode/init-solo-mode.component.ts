import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Constants } from '@app/constants/global.constants';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-init-solo-mode',
    templateUrl: './init-solo-mode.component.html',
    styleUrls: ['./init-solo-mode.component.scss'],
})
export class InitSoloModeComponent implements OnInit {
    readonly gameTypesList = Constants.gameTypesList;
    readonly turnLengthList = Constants.turnLengthList;
    readonly botNames = Constants.botNames;
    readonly minutesList = Constants.turnLengthMinutes;
    readonly secondsList = Constants.turnLengthSeconds;
    firstPlayerName: string;
    secondPlayerName: string;
    nameForm: FormGroup;

    constructor(public game: GameService) {}

    ngOnInit(): void {
        this.secondPlayerName = this.randomizeBotName(this.botNames);
    }

    botNameChange(firstPlayerName: string): void {
        while (firstPlayerName === this.secondPlayerName) {
            this.secondPlayerName = this.randomizeBotName(Constants.botNames);
        }
    }
    confirmInitialization(name: string): boolean {
        const nameForm = new FormGroup({
            control: new FormControl(name, [
                Validators.required,
                Validators.minLength(Constants.minSizeName),
                Validators.maxLength(Constants.maxSizeName),
                this.isNameValidator(),
            ]),
        });
        this.nameForm = nameForm;
        if (nameForm.valid) {
            this.game.randomizeTurn();
            this.firstPlayerName = name;
            this.botNameChange(this.firstPlayerName);
            // Had to cast the parts of the addition to Numbers otherwise it was considered as a string
            this.game.time = Number(this.game.minutes * Constants.timeConstant) + Number(this.game.seconds);
            return true;
        }
        return false;
    }

    randomizeBotName(nameArr: string[]): string {
        const randomIndex = Math.floor(Math.random() * nameArr.length);
        return nameArr[randomIndex];
    }

    isNameValidator(): ValidatorFn {
        return this.nameValidatorFunction as ValidatorFn;
    }

    private nameValidatorFunction(control: FormControl): { [key: string]: boolean } | null {
        // We make sure that player name is considered as a string
        const playerName = control.value as string;
        if (playerName !== undefined && playerName !== null) {
            for (let index = 0; index < playerName.length; index++) {
                if (!/[a-zA-Z]/.test(playerName.charAt(index))) return { ['containsOnlyLetters']: true };
            }
            const firstLetter = playerName[0];
            if (firstLetter !== firstLetter.toUpperCase()) {
                return { ['startsWithLowerLetter']: true };
            }
        }
        return null;
    }
}
