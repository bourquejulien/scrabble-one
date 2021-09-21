import { Component, OnInit } from '@angular/core';
import { letterDefinitions } from '@app/classes/letter';
import { PlayerService } from '@app/services/player.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-rack',
    templateUrl: './rack.component.html',
    styleUrls: ['./rack.component.scss'],
})
export class RackComponent implements OnInit {
    rack: string[] = [];
    subscription: Subscription;

    constructor(private playerService: PlayerService) {}

    ngOnInit() {
        this.playerService.rackUpdated.subscribe((data) => { this.refreshRack() });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    ngAfterViewInit() {
        this.refreshRack();
    }
    retrievePoints(letter: string): number {
        const currentLetterData = letterDefinitions.get(letter);

        if (currentLetterData?.points === undefined) return -1;
        if (letter === ' ') return 0;

        return currentLetterData.points;
    }

    // For testing purposes only; to check if UI rack updates removed letters
    clickToPop(): void {
        this.playerService.updateRack('E');
        //this.refreshRack();

        console.log('player rack: /n');
        for (const letter of this.playerService.rack) console.log(letter);
        console.log('component rack: /n');
        for (const letter of this.rack) console.log(letter);
    }

    refreshRack(): void {
        this.rack = [];

        for (const letter of this.playerService.rack) {
            if (letter === '*') {
                this.rack.push(' ');
            }
            this.rack.push(letter);
        }
    }
}