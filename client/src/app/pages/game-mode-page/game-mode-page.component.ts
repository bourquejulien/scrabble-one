import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { InitGameComponent } from '@app/components/init-game/init-game.component';
import { AdminService } from '@app/services/admin/admin.service';
import { PlayerNameService } from '@app/services/player-name/player-name.service';
import { GameMode, GameType } from '@common';

@Component({
    selector: 'app-game-mode-page',
    templateUrl: './game-mode-page.component.html',
    styleUrls: ['./game-mode-page.component.scss'],
})
export class GameModePageComponent implements OnInit {
    typeOfGameType: typeof GameType;
    typeOfGameMode: typeof GameMode;
    gameMode: GameMode;

    private isDialogOpen: boolean;

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
        this.isDialogOpen = false;
    }

    async openDialog(gameType: GameType): Promise<void> {
        if (this.isDialogOpen) {
            return;
        }

        this.isDialogOpen = true;

        try {
            await this.playerNameService.retrievePlayerNames();
            await this.adminService.retrieveDictionaries();

            if (this.adminService.defaultDictionary === null) {
                throw new Error('Cannot retrieve default dictionnary');
            }

            this.dialog.open(InitGameComponent, {
                panelClass: 'init-game-dialog',
                autoFocus: false,
                data: { gameType, gameMode: this.gameMode },
            });
        } finally {
            this.isDialogOpen = false;
        }
    }
}
