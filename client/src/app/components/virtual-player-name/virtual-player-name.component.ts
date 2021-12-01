import { Component, OnDestroy, OnInit } from '@angular/core';
import { VirtualPlayerLevel, VirtualPlayerName } from '@common';
import { NameValidator } from '@app/classes/form-validation/name-validator';
import { Subscription } from 'rxjs';
import { AdminService } from '@app/services/admin/admin.service';

@Component({
    selector: 'app-virtual-player-name',
    templateUrl: './virtual-player-name.component.html',
    styleUrls: ['./virtual-player-name.component.scss'],
})
export class VirtualPlayerNameComponent implements OnInit, OnDestroy {
    isExpertSelected: boolean;
    isSelected: boolean;
    nameValidator: NameValidator;
    originName: VirtualPlayerName | null;

    playerNames: VirtualPlayerName[];

    private playerNamesSubscription: Subscription;

    constructor(public adminService: AdminService) {
        this.isExpertSelected = false;
        this.isSelected = false;
        this.nameValidator = new NameValidator();
        this.originName = null;
    }

    ngOnInit(): void {
        this.playerNamesSubscription = this.adminService.onVirtualPlayerUpdate.subscribe((playerNames) => this.playerNamesUpdated(playerNames));
    }

    ngOnDestroy(): void {
        this.playerNamesSubscription.unsubscribe();
    }

    get selectedPlayerLevel(): VirtualPlayerLevel {
        return this.isExpertSelected ? VirtualPlayerLevel.Expert : VirtualPlayerLevel.Easy;
    }

    virtualPlayerNamesByLevel(level: VirtualPlayerLevel): VirtualPlayerName[] {
        return this.playerNames.filter((n) => n.level === level);
    }

    select(playerName: VirtualPlayerName): void {
        if (playerName.isReadonly) {
            return;
        }

        this.originName = playerName;
        this.nameValidator.name = playerName.name;
        this.isSelected = true;
    }

    add() {
        this.originName = null;
        this.nameValidator.reset();
        this.isSelected = true;
    }

    reset() {
        this.originName = null;
        this.nameValidator.reset();
        this.isSelected = false;
    }

    changeName(): void {
        this.nameValidator.validate();

        if (!this.nameValidator.isValid) {
            return;
        }

        const isNewName = this.playerNames.findIndex((p) => p.name === this.nameValidator.name) === -1;

        if (!isNewName) {
            this.nameValidator.errors.push('Le nom existe déjà');
            return;
        }

        if (this.originName == null) {
            this.adminService.addPlayerName(this.nameValidator.name, this.selectedPlayerLevel);
            return;
        }

        this.adminService.updatePlayerName(this.originName.name, this.nameValidator.name);
    }

    private playerNamesUpdated(playerNames: VirtualPlayerName[]) {
        this.reset();
        this.playerNames = playerNames;
    }
}
