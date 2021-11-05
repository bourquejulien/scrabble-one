import { Component, AfterViewInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { RoomService } from '@app/services/room/room.service';
import { Subscription } from 'rxjs';
import { AvailableGameConfig, MultiplayerJoinConfig } from '@common';
import { trigger, style, animate, transition } from '@angular/animations';
import { NameValidator } from '@app/classes/form-validation/name-validator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

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
export class RoomListComponent implements AfterViewInit, OnDestroy {
    @ViewChild('alertDialog') alertDialog: TemplateRef<unknown>;

    availableGameConfigs: AvailableGameConfig[];
    selectedConfig: AvailableGameConfig | null;
    nameValidator: NameValidator;
    readonly errorsList: string[];

    private roomSubscription: Subscription;

    constructor(readonly roomService: RoomService, private readonly router: Router, readonly dialog: MatDialog) {
        this.availableGameConfigs = [];
        this.selectedConfig = null;
        this.errorsList = [];
        this.nameValidator = new NameValidator();
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
            .open(this.alertDialog)
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

    private refreshConfig(availableGameConfigs: AvailableGameConfig[]) {
        this.availableGameConfigs = availableGameConfigs;

        if (this.availableGameConfigs.findIndex((c) => c.id === this.selectedConfig?.id) === -1) {
            this.reset();
            this.openErrorDialog();
        }
    }
}
