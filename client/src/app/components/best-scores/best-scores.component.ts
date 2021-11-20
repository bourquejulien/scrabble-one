import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-best-scores',
    templateUrl: './best-scores.component.html',
    styleUrls: ['./best-scores.component.scss']
})
export class BestScoresComponent {

    constructor(public dialog: MatDialog) {}

    ngOnInit(): void {
    }
}
