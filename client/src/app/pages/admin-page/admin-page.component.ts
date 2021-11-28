import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '@app/services/admin/admin.service';
import { VirtualPlayerLevel, VirtualPlayerName } from '@common';
import { NameValidator } from '@app/classes/form-validation/name-validator';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit, OnDestroy {
    isExpertSelected: boolean;
    isSelected: boolean;
    nameValidator: NameValidator;
    originName: VirtualPlayerName | null;

    playerNames: VirtualPlayerName[];

    private playerNamesSubscription: Subscription;

    constructor(public adminService: AdminService, private snackbar: MatSnackBar) {
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

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) {
            return;
        }
        this.adminService.uploadFile(input.files[0]);
    }

    updateDictionaries() {
        this.adminService
            .updateDictionaries()
            .then(() => {
                this.snackbar.open('Dictionnaires mis à jour', 'Fermer');
            })
            .catch(() => {
                this.snackbar.open('Erreur lors de la mise à jour des dictionnaires', 'Fermer');
            });
    }

    downloadDictionary(id: string) {
        this.adminService.downloadDictionary(id).subscribe((result) => {
            const obj = JSON.stringify(result);
            const blob = new Blob([obj], { type: 'application/json' });
            const a = document.createElement('a');
            const objectUrl = URL.createObjectURL(blob);
            a.href = objectUrl;
            a.download = 'dictionary.json';
            a.click();
            URL.revokeObjectURL(objectUrl);
        });
    }

    resetSettings() {
        this.adminService
            .resetSettings()
            .then(() => {
                window.location.reload();
            })
            .catch(() => {
                window.location.reload();
            });
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
