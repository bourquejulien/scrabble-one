import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Error } from '@app/classes/errorName/error';
import { TimeSpan } from '@app/classes/time/timespan';
import { GameService } from '@app/services/game/game.service';
import { GameType, SinglePlayerConfig } from '@common';

interface FormConfig {
    gameType: string;
    playTime: TimeSpan;
    isRandomBonus: boolean;
    firstPlayerName: string;
    secondPlayerName: string;
}

const GAME_TYPES_LIST = ['Mode Solo Débutant'];
const BOT_NAMES = ['Maurice', 'Claudette', 'Alphonse'];
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
    readonly gameTypesList = GAME_TYPES_LIST;
    readonly botNames = BOT_NAMES;
    readonly minutesList = TURN_LENGTH_MINUTES;
    readonly secondsList = TURN_LENGTH_SECONDS;
    readonly gameType = GameType;
    readonly errorsList: string[] = [];
    minutes: number = DEFAULT_PLAY_TIME.totalMinutes;
    seconds: number = DEFAULT_PLAY_TIME.seconds;
    formConfig: FormConfig = {
        gameType: GAME_TYPES_LIST[0],
        playTime: DEFAULT_PLAY_TIME,
        isRandomBonus: false,
        firstPlayerName: '',
        secondPlayerName: '',
    };
    private nameForm: FormGroup;

    constructor(
        readonly gameService: GameService,
        private readonly router: Router,
        readonly dialogRef: MatDialogRef<InitGameComponent>,
        @Inject(MAT_DIALOG_DATA) readonly data: { gameModeType: GameType },
    ) {}

    private static nameValidatorFunction(control: FormControl): { [key: string]: boolean } | null {
        // We make sure that player name is considered as a string
        const playerName = control.value as string;
        if (playerName !== undefined && playerName !== null && playerName !== '') {
            for (let index = 0; index < playerName.length; index++) {
                if (!/[a-zA-ZÉéÎîÇçÏï]/.test(playerName.charAt(index))) return { ['containsOnlyLetters']: true };
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
            await this.init();
        }
    }

    async ngOnInit(): Promise<void> {
        this.formConfig.secondPlayerName = InitGameComponent.randomizeBotName(this.botNames);
    }

    async init(): Promise<void> {
        const needsToReroute: boolean = this.confirmInitialization();

        if (needsToReroute) {
            this.dialogRef.close();

            switch (this.data.gameModeType) {
                case GameType.SinglePlayer:
                    await this.initSinglePlayer();
                    break;
                case GameType.Multiplayer:
                    await this.initMultiplayer();
                    break;
            }
        }
    }

    manageTimeLimits() {
        this.forceSecondsToThirty();
        this.forceSecondsToZero();
    }

    botNameChange(firstPlayerName: string): void {
        while (firstPlayerName === this.formConfig.secondPlayerName) {
            this.formConfig.secondPlayerName = InitGameComponent.randomizeBotName(BOT_NAMES);
        }
    }

    private async initSinglePlayer(): Promise<void> {
        const singlePlayerConfig: SinglePlayerConfig = {
            gameType: GameType.SinglePlayer,
            playTimeMs: this.formConfig.playTime.totalMilliseconds,
            playerName: this.formConfig.firstPlayerName,
            virtualPlayerName: this.formConfig.secondPlayerName,
            isRandomBonus: this.formConfig.isRandomBonus,
        };

        await this.gameService.startSinglePlayer(singlePlayerConfig);
        await this.router.navigate(['game']);
    }

    private async initMultiplayer(): Promise<void> {
        // const multiplayerConfig: MultiplayerCreateConfig = {
        //     gameType: GameType.Multiplayer,
        //     playTimeMs: this.gameConfig.playTime.totalMilliseconds,
        //     playerName: this.gameConfig.firstPlayerName,
        // };

        // TODO Pass config to waiting room
        await this.router.navigate(['waiting-room']);
    }

    private forceSecondsToZero(): void {
        if (this.minutes === TURN_LENGTH_MINUTES[5]) this.seconds = 0;
    }

    private forceSecondsToThirty(): void {
        if (this.minutes === TURN_LENGTH_MINUTES[0]) this.seconds = 30;
    }

    private confirmInitialization(): boolean {
        const nameForm = new FormGroup({
            control: new FormControl(this.formConfig.firstPlayerName, [
                Validators.required,
                Validators.minLength(MIN_SIZE_NAME),
                Validators.maxLength(MAX_SIZE_NAME),
                InitGameComponent.isNameValidator(),
            ]),
        });

        this.nameForm = nameForm;

        if (nameForm.valid) {
            this.formConfig.playTime = TimeSpan.fromMinutesSeconds(this.minutes, this.seconds);

            return true;
        } else {
            this.errorsList.length = 0;
            for (const error of POSSIBLE_ERRORS) {
                // nameForm.get('control') cannot be null since we initialize it in the constructor
                if (this.nameForm.get('control')?.hasError(error.validationRule)) {
                    this.errorsList.push(error.validationMessage);
                }
            }
        }
        return false;
    }
}
