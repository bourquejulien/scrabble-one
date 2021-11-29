import { animate, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NameValidator } from '@app/classes/form-validation/name-validator';
import { RoomService } from '@app/services/room/room.service';
import { AvailableGameConfig, GameMode, MultiplayerJoinConfig } from '@common';
import { Subscription } from 'rxjs';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';

@Component({
    selector: 'app-room-list',
    animations: [
        // Reference: https://stackoverflow.com/a/36417971
        trigger('slideAnimation', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('200ms', style({ transform: 'translateX(0)', opacity: 1 })),
            ]),
            transition(':leave', [
                style({ transform: 'translateX(0)', opacity: 1 }),
                animate('200ms', style({ transform: 'translateX(100%)', opacity: 0 })),
            ]),
        ]),
    ],
    templateUrl: './room-list.component.html',
    styleUrls: ['./room-list.component.scss'],
})
export class RoomListComponent implements AfterViewInit, OnInit, OnDestroy {
    gameModeType: typeof GameMode;
    gameMode: GameMode;

    availableGameConfigs: AvailableGameConfig[];
    selectedConfig: AvailableGameConfig | null;
    nameValidator: NameValidator;
    readonly errorsList: string[];

    private roomSubscription: Subscription;

    constructor(readonly roomService: RoomService, private readonly router: Router, private route: ActivatedRoute, readonly dialog: MatDialog) {
        this.gameModeType = GameMode;

        this.availableGameConfigs = [];
        this.selectedConfig = null;
        this.errorsList = [];
        this.nameValidator = new NameValidator();
    }

    ngOnInit() {
        this.gameMode = GameMode[this.route.snapshot.paramMap.get('game-mode') as keyof typeof GameMode] ?? GameMode.Classic;
    }

    ngAfterViewInit(): void {
        this.roomService.init();
        this.roomService.refresh();
        this.roomSubscription = this.roomService.onAvailable.subscribe((configs) => this.refreshConfig(configs));
    }

    ngOnDestroy() {
        this.roomSubscription.unsubscribe();
    }

    reset() {
        this.selectedConfig = null;
        this.errorsList.length = 0;
        this.nameValidator.reset();
    }

    randomJoin(): void {
        if (this.availableGameConfigs.length <= 1) {
            return;
        }
        const randomGame: number = this.getRandomInt(0, this.availableGameConfigs.length);
        this.selectedConfig = this.availableGameConfigs[randomGame];
    }

    async join() {
        if (!this.validateForm() || this.selectedConfig == null) {
            return;
        }

        const joinConfig: MultiplayerJoinConfig = { sessionId: this.selectedConfig.id, playerName: this.nameValidator.name };

        this.reset();
        const isJoined = await this.roomService.join(joinConfig);

        if (!isJoined) {
            this.openErrorDialog();
        }

        await this.router.navigate(['game']);
        this.reset();
    }

    private openErrorDialog() {
        this.dialog
            .open(ErrorDialogComponent, {
                panelClass: 'app-error-dialog',
                data: { warningMessage: "La partie sélectionnée n'est plus disponible.\nVeuillez en choisir une autre." },
            })
            .afterClosed()
            .subscribe(() => this.reset());
    }

    private validateForm(): boolean {
        this.nameValidator.validate();
        this.errorsList.length = 0;
        this.errorsList.push(...this.nameValidator.errors);

        if (this.nameValidator.name === this.selectedConfig?.waitingPlayerName) {
            this.errorsList.push('*Nom des joueurs identique.');
        }

        return this.errorsList.length === 0;
    }

    private getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    private refreshConfig(availableGameConfigs: AvailableGameConfig[]) {
        this.availableGameConfigs = availableGameConfigs.filter((c) => c.gameMode === this.gameMode);

        if (this.selectedConfig === null) {
            return;
        }

        const selectedConfigAvailable = this.availableGameConfigs.findIndex((c) => c.id === this.selectedConfig?.id) > -1;
        if (!selectedConfigAvailable) {
            this.reset();
            this.openErrorDialog();
        }
    }
}
