import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Constants } from '@app/constants/global.constants';
import { GameService } from '@app/services/game/game.service';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

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
    nameForm: FormGroup;

    constructor(public game: GameService,public router: Router,public dialogRef: MatDialogRef<InitSoloModeComponent> ) {}

    ngOnInit(): void {
        this.game.gameConfig.secondPlayerName = this.randomizeBotName(this.botNames);
    }

    botNameChange(firstPlayerName: string): void {
        while (firstPlayerName === this.game.gameConfig.secondPlayerName) {
            this.game.gameConfig.secondPlayerName = this.randomizeBotName(Constants.botNames);
        }
    }

    initialize(name: string): void {
        console.log(name);
        const needsToReroute: boolean = this.confirmInitialization(name);
        if (needsToReroute) {
            this.router.navigate(['game']);
            this.dialogRef.close();
        }
    }

    randomizeBotName(nameArr: string[]): string {
        const randomIndex = Math.floor(Math.random() * nameArr.length);
        return nameArr[randomIndex];
    }

    isNameValidator(): ValidatorFn {
        return this.nameValidatorFunction as ValidatorFn;
    }
    private confirmInitialization(name: string): boolean {
        console.log("bouton appuye");
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
            this.game.gameConfig.firstPlayerName = name;
            this.botNameChange(this.game.gameConfig.firstPlayerName);
            // Had to cast the parts of the addition to Numbers otherwise it was considered as a string
            this.game.gameConfig.time = Number(this.game.gameConfig.minutes * Constants.timeConstant) + Number(this.game.gameConfig.seconds);
            console.log("init");
            return true;

        }
        console.log("no init");
        return false;
    }
    private nameValidatorFunction(control: FormControl): { [key: string]: boolean } | null {
        // We make sure that player name is considered as a string
        const playerName = control.value as string;
        console.log(playerName);
        if (playerName !== undefined && playerName !== null && playerName !== "") {
            for (let index = 0; index < playerName.length; index++) {
                if (!/[a-zA-Z||ÉéÎîÉéÇçÏï]/.test(playerName.charAt(index))) return { ['containsOnlyLetters']: true };
            }
            const firstLetter = playerName[0];
            console.log(firstLetter,playerName[0]);
            if (firstLetter !== firstLetter.toUpperCase()) {
                return { ['startsWithLowerLetter']: true };
            }
        }
        return null;
    }

    onNoClick(): void {
        this.dialogRef.close();
      }
}
