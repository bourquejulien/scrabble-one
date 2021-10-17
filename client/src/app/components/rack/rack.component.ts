import { Component, HostListener } from '@angular/core';
import { letterDefinitions } from '@common';
import { RackService } from '@app/services/rack/rack.service';

@Component({
    selector: 'app-rack',
    templateUrl: './rack.component.html',
    styleUrls: ['./rack.component.scss'],
})
export class RackComponent {
    swapSelection: number = -1;
    lastIndex = 0;

    constructor(readonly rackService: RackService) {}

    @HostListener('window:keyup', ['$event'])
    keyEvent(event: KeyboardEvent) {
        if (this.swapSelection < 0) return;

        switch (event.key) {
            case 'ArrowRight':
                this.swapSelection = this.rackService.swapRight(this.swapSelection);
                break;
            case 'ArrowLeft':
                this.swapSelection = this.rackService.swapLeft(this.swapSelection);
                break;
            default:
                this.handleKeyPress(event.key);
                break;
        }
    }

    onMousewheel(event: WheelEvent): void {
        if (this.swapSelection < 0) return;

        if (event.deltaY < 0) {
            this.swapSelection = this.rackService.mod(this.swapSelection + 1);
        } else {
            this.swapSelection = this.rackService.mod(this.swapSelection - 1);
        }
    }

    onClick(position: number): void {
        this.swapSelection = position;
    }

    removeFocus() {
        this.swapSelection = -1;
        this.lastIndex = 0;
    }

    retrievePoints(letter: string): number {
        const currentLetterData = letterDefinitions.get(letter);

        if (currentLetterData?.points === undefined) return -1;

        return currentLetterData.points;
    }

    private handleKeyPress(key: string) {
        const index = this.rackService.indexOf(key, this.lastIndex);

        if (index !== -1) {
            this.swapSelection = index;
            this.lastIndex = index + 1;
        } else {
            this.swapSelection = -1;
        }
    }
}
