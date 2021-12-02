import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '@app/services/admin/admin.service';
import { Subscription } from 'rxjs';
import { Answer } from '@common';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit, OnDestroy {
    private errorSubscription: Subscription;

    constructor(public adminService: AdminService, private snackbar: MatSnackBar) {}

    ngOnInit() {
        this.errorSubscription = this.adminService.onNotify.subscribe((message) => this.notify(message));
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
        this.adminService.updateDictionaries();
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

    private notify(warningMessage: Answer<string>) {
        this.snackbar.open(warningMessage.payload, 'Fermer');
    }
}
