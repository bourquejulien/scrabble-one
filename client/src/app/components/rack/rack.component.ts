import { Component, OnInit } from '@angular/core';
import { letterDefinitions } from '@app/classes/letter';
import { PlayerService } from '@app/services/player/player.service';

@Component({
    selector: 'app-rack',
    templateUrl: './rack.component.html',
    styleUrls: ['./rack.component.scss'],
})
export class RackComponent implements OnInit {
    rack: string[] = [];

    constructor(private playerService: PlayerService) {}

    ngOnInit() {
        this.playerService.rackUpdated.subscribe(() => {
            this.refreshRack();
        });
    }

    retrievePoints(letter: string): number {
        const currentLetterData = letterDefinitions.get(letter);

        if (currentLetterData?.points === undefined) return -1;

        return currentLetterData.points;
    }

    refreshRack(): void {
        this.rack = [];
        const playerRack: string[] = this.playerService.rackContent;

        if (playerRack === undefined) return;

        for (const letter of playerRack) {
            this.rack.push(letter);
        }
    }
}
