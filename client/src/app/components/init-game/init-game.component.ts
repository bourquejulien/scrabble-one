import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TimeSpan } from '@app/classes/time/timespan';
import { GameService } from '@app/services/game/game.service';
import { GameType, MultiplayerCreateConfig, SinglePlayerConfig } from '@common';
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
const TURN_LENGTH_MINUTES = [0, 1, 2, 3, 4, 5] as const;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Lists all option, the list is a constant
const TURN_LENGTH_SECONDS = [0, 30] as const;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Default play time is readable and immutable
const DEFAULT_PLAY_TIME = TimeSpan.fromMinutesSeconds(1, 0);

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
    readonly gameType;
    readonly nameValidator: NameValidator;
    minutes: number;
    seconds: number;
    formConfig: FormConfig;

    constructor(
        readonly gameService: GameService,
        private readonly router: Router,
        private readonly roomService: RoomService,
        readonly dialogRef: MatDialogRef<InitGameComponent>,
        @Inject(MAT_DIALOG_DATA) readonly data: { gameModeType: GameType },
    ) {
        this.gameTypesList = Constants.GAME_TYPES_LIST;
        this.botNames = Constants.BOT_NAMES;
        this.minutesList = TURN_LENGTH_MINUTES;
        this.secondsList = TURN_LENGTH_SECONDS;
        this.gameType = GameType;
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
            this.formConfig.secondPlayerName = InitGameComponent.randomizeBotName(this.botNames);
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
        const multiplayerConfig: MultiplayerCreateConfig = {
            gameType: GameType.Multiplayer,
            playTimeMs: this.formConfig.playTime.totalMilliseconds,
            playerName: this.formConfig.firstPlayerName,
            isRandomBonus: this.formConfig.isRandomBonus,
        };

        await this.roomService.create(multiplayerConfig);
        await this.router.navigate(['waiting-room']);
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
