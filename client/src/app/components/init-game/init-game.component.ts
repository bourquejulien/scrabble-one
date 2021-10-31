import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Error } from '@app/classes/errorName/error';
import { GameConfig } from '@app/classes/game-config';
import { GameType } from '@app/classes/game-type';
import { TimeSpan } from '@app/classes/time/timespan';
import { GameService } from '@app/services/game/game.service';
import { SinglePlayerGameConfig } from '@common';

const GAME_TYPES_LIST = ['Mode Solo Débutant'];
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Lists all option, the list is a constant
const TURN_LENGTH_MINUTES = [0, 1, 2, 3, 4, 5] as const;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Lists all option, the list is a constant
const TURN_LENGTH_SECONDS = [0, 30] as const;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Default play time is readable and immutable
const DEFAULT_PLAY_TIME = TimeSpan.fromMinutesSeconds(1, 0);
const MAX_SIZE_NAME = 16;
const MIN_SIZE_NAME = 3;
const MIN_LENGTH_ERROR: Error = {
    validationRule: 'minlength',
    validationMessage: '*Le nom doit contenir au moins 3 caractères.\n',
};
const MAX_LENGTH_ERROR: Error = {
    validationRule: 'maxlength',
    validationMessage: '*Le nom doit au maximum contenir 16 lettres.\n',
};
const REQUIRED_ERROR: Error = {
    validationRule: 'required',
    validationMessage: '*Un nom doit être entré.\n',
};
const CONTAINS_NOT_LETTERS_ERROR: Error = {
    validationRule: 'containsOnlyLetters',
    validationMessage: '*Le nom doit seulement être composé de lettres.\n',
};
const STARTS_LOWER_LETTER_ERROR: Error = {
    validationRule: 'startsWithLowerLetter',
    validationMessage: '*Le nom doit débuter par une majuscule.\n',
};
const POSSIBLE_ERRORS: Error[] = [STARTS_LOWER_LETTER_ERROR, CONTAINS_NOT_LETTERS_ERROR, REQUIRED_ERROR, MAX_LENGTH_ERROR, MIN_LENGTH_ERROR];

@Component({
    selector: 'app-init-game',
    templateUrl: './init-game.component.html',
    styleUrls: ['./init-game.component.scss'],
})
export class InitGameComponent implements OnInit {
    readonly gameTypesList;
    readonly botNames: string[];
    readonly minutesList;
    readonly secondsList;
    nextPage: string;
    nameForm: FormGroup;
    gameType;
    errorsList: string[];
    minutes: number;
    seconds: number;
    gameConfig: GameConfig;

    constructor(
        public gameService: GameService,
        private router: Router,
        public dialogRef: MatDialogRef<InitGameComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { gameModeType: GameType },
    ) {
        this.setNextPage();
        // TO DO ask julien if this is legit?? its like, doing "index = number"
        this.gameType = GameType;
        this.errorsList = [];
        this.minutes = DEFAULT_PLAY_TIME.totalMinutes;
        this.seconds = DEFAULT_PLAY_TIME.seconds;
        this.gameConfig = {
            gameType: GAME_TYPES_LIST[0],
            playTime: DEFAULT_PLAY_TIME,
            firstPlayerName: '',
            secondPlayerName: '',
        };

        this.gameTypesList = GAME_TYPES_LIST;
        this.botNames = ['Maurice', 'Claudette', 'Alphonse'];
        this.minutesList = TURN_LENGTH_MINUTES;
        this.secondsList = TURN_LENGTH_SECONDS;
    }

    private static nameValidatorFunction(control: FormControl): { [key: string]: boolean } | null {
        // We make sure that player name is considered as a string
        const playerName = control.value as string;
        if (playerName !== undefined && playerName !== null && playerName !== '') {
            for (let index = 0; index < playerName.length; index++) {
                if (!/[a-zA-ZÉéÎîÉéÇçÏï]/.test(playerName.charAt(index))) {
                    return { ['containsOnlyLetters']: true };
                }
            }

            const firstLetter = playerName[0];
            if (firstLetter !== firstLetter.toUpperCase()) {
                return { ['startsWithLowerLetter']: true };
            }
        }
        return null;
    }

    private static randomizeBotName(nameArr: string[]): string {
        const randomIndex = Math.floor(Math.random() * nameArr.length);
        return nameArr[randomIndex];
    }

    private static isNameValidator(): ValidatorFn {
        return InitGameComponent.nameValidatorFunction as ValidatorFn;
    }

    @HostListener('keydown', ['$event'])
    async buttonDetect(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            await this.initialize();
        }
    }

    async ngOnInit(): Promise<void> {
        await this.gameService.reset();
        this.gameConfig.secondPlayerName = InitGameComponent.randomizeBotName(this.botNames);
    }

    async initialize(): Promise<void> {
        const needsToReroute: boolean = this.confirmInitialization();

        if (needsToReroute) {
            this.dialogRef.close();

            // TODO Should be able to redirect to waiting room or GameService with proper configs
            const singlePlayerConfig: SinglePlayerGameConfig = {
                gameType: this.gameConfig.gameType,
                playTimeMs: this.gameConfig.playTime.totalMilliseconds,
                playerName: this.gameConfig.firstPlayerName,
                virtualPlayerName: this.gameConfig.secondPlayerName,
            };

            await this.gameService.startSinglePlayer(singlePlayerConfig);
            await this.router.navigate([this.nextPage]);
        }
    }

    manageTimeLimits() {
        this.forceSecondsToThirty();
        this.forceSecondsToZero();
    }

    botNameChange(firstPlayerName: string): void {
        while (firstPlayerName === this.gameConfig.secondPlayerName) {
            this.gameConfig.secondPlayerName = InitGameComponent.randomizeBotName(this.botNames);
        }
    }

    private forceSecondsToZero(): void {
        if (this.minutes === TURN_LENGTH_MINUTES[5]) {
            this.seconds = 0;
        }
    }

    private forceSecondsToThirty(): void {
        if (this.minutes === TURN_LENGTH_MINUTES[0]) {
            this.seconds = 30;
        }
    }

    private confirmInitialization(): boolean {
        const nameForm = new FormGroup({
            control: new FormControl(this.gameConfig.firstPlayerName, [
                Validators.required,
                Validators.minLength(MIN_SIZE_NAME),
                Validators.maxLength(MAX_SIZE_NAME),
                InitGameComponent.isNameValidator(),
            ]),
        });

        this.nameForm = nameForm;

        if (nameForm.valid) {
            this.gameConfig.playTime = TimeSpan.fromMinutesSeconds(this.minutes, this.seconds);

            return true;
        }
        this.errorsList = [];
        for (const error of POSSIBLE_ERRORS) {
            // nameForm.get('control') cannot be null since we initialize it in the constructor
            if (this.nameForm.get('control')?.hasError(error.validationRule)) {
                this.errorsList.push(error.validationMessage);
            }
        }
        return false;
    }

    private setNextPage(): void {
        if (this.data.gameModeType === GameType.Solo) {
            this.nextPage = 'game';
        }
        if (this.data.gameModeType === GameType.CreateOnline) {
            this.nextPage = 'waiting-room';
        }
    }
}
