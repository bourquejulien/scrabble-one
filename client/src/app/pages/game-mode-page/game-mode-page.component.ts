import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InitGameComponent } from '@app/components/init-game/init-game.component';
import { GameMode, GameType } from '@common';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '@app/services/admin/admin.service';
import { PlayerNameService } from '@app/services/player-name/player-name.service';

@Component({
    selector: 'app-game-mode-page',
    templateUrl: './game-mode-page.component.html',
    styleUrls: ['./game-mode-page.component.scss'],
})
export class GameModePageComponent implements OnInit {
    typeOfGameType: typeof GameType;
    typeOfGameMode: typeof GameMode;
    gameMode: GameMode;

    constructor(
        readonly dialog: MatDialog,
        private readonly route: ActivatedRoute,
        private readonly adminService: AdminService,
        private readonly playerNameService: PlayerNameService,
    ) {
        this.typeOfGameType = GameType;
        this.typeOfGameMode = GameMode;
    }

    ngOnInit() {
        this.gameMode = GameMode[this.route.snapshot.paramMap.get('game-mode') as keyof typeof GameMode] ?? GameMode.Classic;
    }

    async openDialog(gameType: GameType): Promise<void> {
        await this.playerNameService.retrievePlayerNames();
        await this.adminService.retrieveDictionaries();

        if (this.adminService.defaultDictionary === null) {
            throw new Error('Cannot retrieve default dictionnary');
        }

        await this.dialog.open(InitGameComponent, { panelClass: 'init-game-dialog', data: { gameType, gameMode: this.gameMode } });
    }
}
