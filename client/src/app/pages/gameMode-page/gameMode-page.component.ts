import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

export interface DialogData {
    animal: string;
    name: string;
}

@Component({
    selector: 'app-secondary-page',
    templateUrl: './gameMode-page.component.html',
    styleUrls: ['./gameMode-page.component.scss'],
})
export class GameModePageComponent {
    constructor(public dialog: MatDialog) {}

    // name:string;
    // gameType:string;
    // time:number;

    // openDialog(): void {
    //     const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
    //       width: '250px',
    //       data: {name: this.name, gameType: this.gameType, time:this.time}
    //     });
    // }
    

    
    
}
