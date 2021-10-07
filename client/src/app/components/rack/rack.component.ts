import { Component } from '@angular/core';
import { letterDefinitions } from '@common/letter';
import { PlayerService } from '@app/services/player/player.service';

@Component({
    selector: 'app-rack',
    templateUrl: './rack.component.html',
    styleUrls: ['./rack.component.scss'],
})
export class RackComponent {
    constructor(readonly playerService: PlayerService) {}

    retrievePoints(letter: string): number {
        const currentLetterData = letterDefinitions.get(letter);

        if (currentLetterData?.points === undefined) return -1;

        return currentLetterData.points;
    }
}
