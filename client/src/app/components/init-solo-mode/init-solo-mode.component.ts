import { Component, OnInit } from '@angular/core';
import { Constants } from '@app/constants/global.constants';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-init-solo-mode',
    templateUrl: './init-solo-mode.component.html',
    styleUrls: ['./init-solo-mode.component.scss'],
})
export class InitSoloModeComponent implements OnInit {
    readonly gameTypesList = Constants.gameTypesList;
    readonly turnLengthList = Constants.turnLengthList;
    readonly botNames = Constants.botNames;
    game = new GameService();

    ngOnInit(): void {
        this.game.secondPlayerName = this.game.randomizeBotName(this.botNames);
    }
}
