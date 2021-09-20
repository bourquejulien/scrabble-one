import { Component, OnInit } from '@angular/core';
import { letterDefinitions } from '@app/classes/letter';
import { ReserveService } from '@app/services/reserve.service';

@Component({
    selector: 'app-rack',
    templateUrl: './rack.component.html',
    styleUrls: ['./rack.component.scss'],
})
export class RackComponent implements OnInit {
    rack: string[] = [];

    constructor(private reserveService: ReserveService) {}

    ngOnInit() {
        const initNbTiles = 7;

        for (let tile = 0; tile < initNbTiles; tile++) {
            this.rack.push(this.reserveService.drawLetter());
        }
    }

    retrievePoints(letter: string): number {
        const currentLetterData = letterDefinitions.get(letter);

        if (currentLetterData?.points === undefined) return -1;

        return currentLetterData.points;
    }
}
