import { Injectable } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Constants } from '@app/constants/global.constants';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    time: number;
    gameType: string;
    firstPlayerName: string;
    secondPlayerName: string;
    turn: boolean;
    nameForm: FormGroup;
    confirmInitialization(name: string): boolean {
        const nameForm = new FormGroup({
            control: new FormControl(name, [
                Validators.required,
                Validators.minLength(Constants.minSizeName),
                Validators.maxLength(Constants.maxSizeName),
                this.isNameValidator(),
            ]),
        });
        console.log(nameForm);
        this.nameForm = nameForm;
        if (nameForm.valid) {
            const randBool = Math.floor(Math.random());
            this.turn = randBool as unknown as boolean;
            this.firstPlayerName = name;
            while (name === this.secondPlayerName) {
                this.secondPlayerName = this.randomizeBotName(Constants.botNames);
            }
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
        // On transforme any en string
        const playerName = control.value as string;
        for (let index = 0; index < playerName.length; index++) {
            if (!/[a-zA-Z]/.test(playerName.charAt(index))) return { ['containsOnlyLetters']: false };
        }
        const firstLetter = playerName[0];
        if (firstLetter !== firstLetter.toUpperCase()) {
            return { ['startsWithLetter']: false };
        }

        return null;
    }
}
