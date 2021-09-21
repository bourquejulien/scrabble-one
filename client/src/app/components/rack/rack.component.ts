import { Component, OnInit } from '@angular/core';
import { letterDefinitions } from '@app/classes/letter';
import { PlayerService } from '@app/services/player.service';
// import { ReserveService } from '@app/services/reserve.service';

@Component({
    selector: 'app-rack',
    templateUrl: './rack.component.html',
    styleUrls: ['./rack.component.scss'],
})
export class RackComponent implements OnInit {
    rack: string[] = [];

    constructor(private playerService: PlayerService) {}

    ngOnInit() {
        for (const letter of this.playerService.rack) {
            this.rack.push(letter);
        }
    }

    retrievePoints(letter: string): number {
        const currentLetterData = letterDefinitions.get(letter);

        if (currentLetterData?.points === undefined) return -1;

        return currentLetterData.points;
    }

    // For testing purposes only; to check if UI rack updates removed letters
    clickToPop(): void {
        this.playerService.updateRack('E');

        // for (const letter of this.playerService.rack) console.log(letter);
    }
}

/**
 * Note to self: from the function above, i noticed that there may be a problem with update rack;
 * if, for example, we have rack : K E N A S L E, update rack only removes one E. All subsequent calls
 * to the function seem to be uneffective. Could it be because of the indexOf?
 *
 * update: i have changed absolutely nothing and now update rack does jack shit i hate it here
 *
 * nvm im just fkg stupid i just selected the wrong rack ;w;
 */
