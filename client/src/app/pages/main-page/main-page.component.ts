import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BestScoresComponent } from '@app/components/best-scores/best-scores.component';
import { HealthService } from '@app/services/health/health.service';
import { GameMode } from '@common';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
    gameMode = GameMode;
    readonly developers: string[];

    constructor(public dialog: MatDialog, private readonly healthService: HealthService, private readonly router: Router) {
        this.developers = [
            'Julien Bourque',
            'Alexandre Dufort',
            'Éloïse Brosseau',
            'Étienne Hourdebaigt',
            'Ikram Kohil',
            'Morgan De Gregorio Beaudoin',
        ];
    }

    ngOnInit(): void {
        this.healthService.isServerOk().catch(async () => this.router.navigate(['/error']));
    }

    openScoresDialog(): void {
        this.dialog.open(BestScoresComponent, { panelClass: 'init-game-dialog', autoFocus: false });
    }
}
