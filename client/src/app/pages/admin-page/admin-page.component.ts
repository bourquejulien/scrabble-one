import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '@app/services/admin/admin.service';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit, OnDestroy {
    private errorSubscription: Subscription;

    constructor(public adminService: AdminService, private snackbar: MatSnackBar, private readonly dialog: MatDialog) {}

    ngOnInit() {
        this.errorSubscription = this.adminService.onerror.subscribe((message) => this.openErrorDialog(message));
    }

    ngOnDestroy() {
        this.errorSubscription.unsubscribe();
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

    private openErrorDialog(warningMessage: string) {
        this.dialog.open(ErrorDialogComponent, {
            panelClass: 'app-error-dialog',
            data: { warningMessage },
        });
    }
}
