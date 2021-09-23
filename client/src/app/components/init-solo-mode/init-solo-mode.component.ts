import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameConfig } from '@app/classes/game-config';
import { Constants } from '@app/constants/global.constants';
import { GameService } from '@app/services/game/game.service';

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

    gameConfig: GameConfig = {
        gameType: Constants.gameTypesList[0],
        minutes: Constants.turnLengthMinutes[1],
        seconds: Constants.turnLengthSeconds[0],
        time: 0,
        firstPlayerName: '',
        secondPlayerName: '',
    };

    constructor(public gameService: GameService, private router: Router) {}

    ngOnInit(): void {
        this.gameConfig.secondPlayerName = this.randomizeBotName(this.botNames);
    }

    initialize(name: string): void {
        const needsToReroute: boolean = this.confirmInitialization(name);

        if (needsToReroute) {
            this.gameService.startGame(this.gameConfig);
            this.router.navigate(['/game']);
        }
    }

    private botNameChange(firstPlayerName: string): void {
        while (firstPlayerName === this.gameConfig.secondPlayerName) {
            this.gameConfig.secondPlayerName = this.randomizeBotName(Constants.botNames);
        }
    }

    private randomizeBotName(nameArr: string[]): string {
        const randomIndex = Math.floor(Math.random() * nameArr.length);
        return nameArr[randomIndex];
    }

    private isNameValidator(): ValidatorFn {
        return this.nameValidatorFunction as ValidatorFn;
    }

    private confirmInitialization(name: string): boolean {
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
            this.gameConfig.firstPlayerName = name;
            this.botNameChange(this.gameConfig.firstPlayerName);
            // Had to cast the parts of the addition to Numbers otherwise it was considered as a string
            this.gameConfig.time = Number(this.gameConfig.minutes * Constants.timeConstant) + Number(this.gameConfig.seconds);
            return true;
        }
        return false;
    }

    private nameValidatorFunction(control: FormControl): { [key: string]: boolean } | null {
        // We make sure that player name is considered as a string
        const playerName = control.value as string;

        if (playerName !== undefined && playerName !== null) {
            for (let index = 0; index < playerName.length; index++) {
                if (!/[a-zA-Z||ÉéÎîÉéÇçÏï]/.test(playerName.charAt(index))) return { ['containsOnlyLetters']: true };
            }

            const firstLetter = playerName[0];
            if (firstLetter !== firstLetter.toUpperCase()) {
                return { ['startsWithLowerLetter']: true };
            }
        }
        return null;
    }
}
