import { Component, OnInit, HostListener } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameConfig } from '@app/classes/game-config';
import { GameService } from '@app/services/game/game.service';
import { MatDialogRef } from '@angular/material/dialog';
import { TimeSpan } from '@app/classes/time/timespan';

const GAME_TYPES_LIST = ['Mode Solo Débutant'];
const BOT_NAMES = ['Maurice', 'Claudette', 'Alphonse'];
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Lists all option, the list is a constant
const TURN_LENGTH_MINUTES = [0, 1, 2, 3, 4, 5] as const;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Lists all option, the list is a constant
const TURN_LENGTH_SECONDS = [0, 15, 30, 45] as const;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Default play time is readable and immutable
const DEFAULT_PLAY_TIME = TimeSpan.fromMinutesSeconds(1, 30);
const MAX_SIZE_NAME = 16;
const MIN_SIZE_NAME = 3;

@Component({
    selector: 'app-init-solo-mode',
    templateUrl: './init-solo-mode.component.html',
    styleUrls: ['./init-solo-mode.component.scss'],
})
export class InitSoloModeComponent implements OnInit {
    readonly gameTypesList = GAME_TYPES_LIST;
    readonly botNames = BOT_NAMES;
    readonly minutesList = TURN_LENGTH_MINUTES;
    readonly secondsList = TURN_LENGTH_SECONDS;
    nameForm: FormGroup;
    minutes: number = DEFAULT_PLAY_TIME.totalMinutes;
    seconds: number = DEFAULT_PLAY_TIME.seconds;

    gameConfig: GameConfig = {
        gameType: GAME_TYPES_LIST[0],
        playTime: DEFAULT_PLAY_TIME,
        firstPlayerName: '',
        secondPlayerName: '',
    };

    constructor(public gameService: GameService, private router: Router, public dialogRef: MatDialogRef<InitSoloModeComponent>) {}

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.initialize();
        }
    }

    ngOnInit(): void {
        this.gameConfig.secondPlayerName = this.randomizeBotName(this.botNames);
    }

    initialize(): void {
        const needsToReroute: boolean = this.confirmInitialization(this.gameConfig.firstPlayerName);

        if (needsToReroute) {
            this.dialogRef.close();
            this.router.navigate(['game']);
            this.gameService.startGame(this.gameConfig);
        }
    }

    private botNameChange(firstPlayerName: string): void {
        while (firstPlayerName === this.gameConfig.secondPlayerName) {
            this.gameConfig.secondPlayerName = this.randomizeBotName(BOT_NAMES);
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
                Validators.minLength(MIN_SIZE_NAME),
                Validators.maxLength(MAX_SIZE_NAME),
                this.isNameValidator(),
            ]),
        });

        this.nameForm = nameForm;

        if (nameForm.valid) {
            this.gameConfig.firstPlayerName = name;
            this.botNameChange(this.gameConfig.firstPlayerName);
            this.gameConfig.playTime = TimeSpan.fromMinutesSeconds(this.minutes, this.seconds);

            return true;
        }
        return false;
    }

    private nameValidatorFunction(control: FormControl): { [key: string]: boolean } | null {
        // We make sure that player name is considered as a string
        const playerName = control.value as string;
        if (playerName !== undefined && playerName !== null && playerName !== '') {
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
