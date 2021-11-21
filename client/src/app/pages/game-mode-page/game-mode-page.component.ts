import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InitGameComponent } from '@app/components/init-game/init-game.component';
import { GameMode, GameType } from '@common';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-game-mode-page',
    templateUrl: './game-mode-page.component.html',
    styleUrls: ['./game-mode-page.component.scss'],
})
export class GameModePageComponent implements OnInit {
    typeOfGameType: typeof GameType;
    gameMode: GameMode;

    constructor(public dialog: MatDialog, private route: ActivatedRoute) {
        this.typeOfGameType = GameType;
    }

    ngOnInit() {
        this.gameMode = GameMode[this.route.snapshot.paramMap.get('game-mode') as keyof typeof GameMode] ?? GameMode.Classic;
    }

    openDialog(gameType: GameType): void {
        this.dialog.open(InitGameComponent, { panelClass: 'init-game-dialog', data: { gameType, gameMode: this.gameMode } });
    }
}
