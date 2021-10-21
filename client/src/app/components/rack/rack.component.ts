import { Component, HostListener, OnInit } from '@angular/core';
import { letterDefinitions } from '@common';
import { RackService } from '@app/services/rack/rack.service';

interface Selection {
    swap: {
        index: number;
        lastIndex: number;
    };
    reserve: Set<number>;
}

@Component({
    selector: 'app-rack',
    templateUrl: './rack.component.html',
    styleUrls: ['./rack.component.scss'],
})
export class RackComponent implements OnInit {
    selection: Selection;
    isFocus = false;

    constructor(readonly rackService: RackService) {}

    @HostListener('body:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        this.handleKeyPress(event.key);

        if (this.selection.swap.index < 0) return;

        switch (event.key) {
            case 'ArrowRight':
                this.selection.swap.index = this.rackService.swapRight(this.selection.swap.index);
                break;
            case 'ArrowLeft':
                this.selection.swap.index = this.rackService.swapLeft(this.selection.swap.index);
                break;
        }
    }

    @HostListener('document:click', ['$event'])
    onClick() {
        if (!this.isFocus) {
            this.reset();
        }
    }

    ngOnInit(): void {
        this.reset();
    }

    onLeftClick(position: number): void {
        this.swapSelectionIndex = position;
    }

    onRightClick(position: number): boolean {
        if (!this.selection.reserve.delete(position) && this.selection.swap.index !== position) {
            this.selection.reserve.add(position);
        }

        return false; // Ensures no context menu is showed.
    }

    onMousewheel(event: WheelEvent): void {
        if (this.selection.swap.index < 0) {
            this.selection.swap.index = 0;
            return;
        }

        if (event.deltaY < 0) {
            this.swapSelectionIndex = this.rackService.mod(this.selection.swap.index + 1);
        } else {
            this.swapSelectionIndex = this.rackService.mod(this.selection.swap.index - 1);
        }
    }

    reset() {
        this.selection = {
            swap: {
                index: -1,
                lastIndex: 0,
            },
            reserve: new Set<number>(),
        };
        this.isFocus = false;
    }

    retrievePoints(letter: string): number {
        const currentLetterData = letterDefinitions.get(letter);

        if (currentLetterData?.points === undefined) return -1;

        return currentLetterData.points;
    }

    private handleKeyPress(key: string) {
        // TODO isFocus a verifier avec un charge
        if (key.length !== 1 || !key.match('([a-z]|\\*)')) return;

        const index = this.rackService.indexOf(key, this.selection.swap.lastIndex);

        if (index !== -1 && this.isFocus) {
            this.swapSelectionIndex = index;
            this.selection.swap.lastIndex = index + 1;
        } else {
            this.reset();
        }
    }

    private set swapSelectionIndex(position: number) {
        this.selection.reserve.delete(position);
        this.selection.swap.index = position;
    }
}
