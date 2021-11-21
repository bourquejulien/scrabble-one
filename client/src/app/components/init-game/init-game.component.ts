import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TimeSpan } from '@app/classes/time/timespan';
import { GameService } from '@app/services/game/game.service';
import { GameMode, GameType, MultiplayerCreateConfig, SinglePlayerConfig } from '@common';
import { RoomService } from '@app/services/room/room.service';
import { Constants } from '@app/constants/global.constants';
import { NameValidator } from '@app/classes/form-validation/name-validator';

interface FormConfig {
    gameType: string;
    playTime: TimeSpan;
    isRandomBonus: boolean;
    firstPlayerName: string;
    secondPlayerName: string;
}

// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Lists all option, the list is a constant
const TURN_LENGTH_MINUTES = [0, 1, 2, 3, 4, 5];
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Lists all option, the list is a constant
const TURN_LENGTH_SECONDS = [0, 30];
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Default play time is readable and immutable
const DEFAULT_PLAY_TIME = TimeSpan.fromMinutesSeconds(1, 0);

@Component({
    selector: 'app-init-game',
    templateUrl: './init-game.component.html',
    styleUrls: ['./init-game.component.scss'],
})
export class InitGameComponent implements OnInit {
    typeOfGameType: typeof GameType;

    gameTypesList: string[];
    botNames: string[];
    minutesList: number[];
    secondsList: number[];

    nameValidator: NameValidator;
    minutes: number;
    seconds: number;
    formConfig: FormConfig;

    constructor(
        readonly gameService: GameService,
        private readonly router: Router,
        private readonly roomService: RoomService,
        readonly dialogRef: MatDialogRef<InitGameComponent>,
        @Inject(MAT_DIALOG_DATA) readonly data: { gameType: GameType; gameMode: GameMode },
    ) {
        this.typeOfGameType = GameType;

        this.gameTypesList = Constants.GAME_TYPES_LIST;
        this.botNames = Constants.BOT_NAMES;
        this.minutesList = TURN_LENGTH_MINUTES;
        this.secondsList = TURN_LENGTH_SECONDS;

        this.nameValidator = new NameValidator();
        this.minutes = DEFAULT_PLAY_TIME.totalMinutes;
        this.seconds = DEFAULT_PLAY_TIME.seconds;
        this.formConfig = {
            gameType: this.gameTypesList[0],
            playTime: DEFAULT_PLAY_TIME,
            isRandomBonus: false,
            firstPlayerName: '',
            secondPlayerName: '',
        };
    }

    private static randomizeBotName(nameArr: string[]): string {
        const randomIndex = Math.floor(Math.random() * nameArr.length);
        return nameArr[randomIndex];
    }

    async ngOnInit(): Promise<void> {
        this.formConfig.secondPlayerName = InitGameComponent.randomizeBotName(this.botNames);
    }

    async init(): Promise<void> {
        const needsToReroute: boolean = this.confirmInitialization();

        if (needsToReroute) {
            this.dialogRef.close();

            if (this.data.gameType === GameType.SinglePlayer) {
                await this.initSinglePlayer();
            } else {
                await this.initMultiplayer();
            }
        }
    }

    manageTimeLimits() {
        this.forceSecondsToThirty();
        this.forceSecondsToZero();
    }

    botNameChange(firstPlayerName: string): void {
        while (firstPlayerName === this.formConfig.secondPlayerName) {
            this.formConfig.secondPlayerName = InitGameComponent.randomizeBotName(this.botNames);
        }
    }

    private async initSinglePlayer(): Promise<void> {
        const singlePlayerConfig: SinglePlayerConfig = {
            gameType: GameType.SinglePlayer,
            gameMode: this.data.gameMode,
            playTimeMs: this.formConfig.playTime.totalMilliseconds,
            playerName: this.formConfig.firstPlayerName,
            virtualPlayerName: this.formConfig.secondPlayerName,
            isRandomBonus: this.formConfig.isRandomBonus,
        };

        await this.gameService.startSinglePlayer(singlePlayerConfig);
        await this.router.navigate(['game']);
    }

    private async initMultiplayer(): Promise<void> {
        console.log(this.data.gameMode)
        const multiplayerConfig: MultiplayerCreateConfig = {
            gameType: GameType.Multiplayer,
            gameMode: this.data.gameMode,
            playTimeMs: this.formConfig.playTime.totalMilliseconds,
            playerName: this.formConfig.firstPlayerName,
            isRandomBonus: this.formConfig.isRandomBonus,
        };

        await this.router.navigate(['waiting-room']);
        await this.roomService.create(multiplayerConfig);
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
        this.nameValidator.validate();

        if (!this.nameValidator.isValid) {
            return false;
        }

        this.formConfig.playTime = TimeSpan.fromMinutesSeconds(this.minutes, this.seconds);
        this.formConfig.firstPlayerName = this.nameValidator.name;

        return true;
    }
}
