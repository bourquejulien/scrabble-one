import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {InitSoloModeComponent} from '@app/components/init-solo-mode/init-solo-mode.component';


@Component({
    selector: 'app-game-mode-page',
    templateUrl: './game-mode-page.component.html',
    styleUrls: ['./game-mode-page.component.scss'],
})
export class GameModePageComponent {
    constructor(public dialog: MatDialog) {}
    name:string;
    gameType:string;
    time:number;
    openDialog(): void {
        const dialogRef = this.dialog.open(InitSoloModeComponent, {
          width: '250px',
          data: {name: this.name, gameType: this.gameType, time:this.time}
        });
    
    dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        this.name = result;
      });
    }
}
