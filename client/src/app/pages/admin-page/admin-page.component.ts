import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '@app/services/admin/admin.service';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    constructor(public adminService: AdminService, private sncakbar: MatSnackBar) {}

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) {
            this.sncakbar.open('Fichier inadmisible pour le téléversement', 'Fermer');
            return;
        }
        this.adminService.uploadFile(input.files[0]);
    }

    removeDictionary(id: string) {
        this.adminService
            .removeDictionary(id)
            .then(() => {
                this.sncakbar.open(`Dictionnaire ${id} a été retiré`, 'Fermer');
            })
            .catch(() => {
                this.sncakbar.open(`Erreur survenue: dictionnaire ${id} n'a pas été retiré`, 'Fermer');
            });
    }

    downloadDictionary(index: number) {
        this.adminService
            .removeDictionary(`${index}`)
            .then(() => {
                this.sncakbar.open(`Dictionnaire ${index} a été retiré`, 'Fermer');
            })
            .catch(() => {
                this.sncakbar.open(`Erreur survenue: dictionnaire ${index} n'a pas été retiré`, 'Fermer');
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
}
