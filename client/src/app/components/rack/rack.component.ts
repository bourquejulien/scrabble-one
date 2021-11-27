import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { CommandsService } from '@app/services/commands/commands.service';
import { RackService } from '@app/services/rack/rack.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { LETTER_DEFINITIONS } from '@common';
import { GameService } from '@app/services/game/game.service';
import { PlayerType } from '@app/classes/player/player-type';

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
    @Output() reserveSelectionChange: EventEmitter<Set<number>>;
    playerType = PlayerType;

    selection: Selection;
    isFocus: boolean;

    constructor(
        readonly rackService: RackService,
        private readonly commandService: CommandsService,
        readonly reserveService: ReserveService,
        readonly gameService: GameService,
    ) {
        this.selection = {
            swap: {
                index: -1,
                lastIndex: 0,
            },
            reserve: new Set<number>(),
        };

        this.isFocus = false;
        this.reserveSelectionChange = new EventEmitter<Set<number>>();
    }

    @HostListener('body:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.handleKeyPress(event.key);

        if (this.selection.swap.index < 0) {
            return;
        }

        switch (event.key) {
            case 'ArrowRight':
                this.selection.swap.index = this.rackService.swapRight(this.selection.swap.index);
                this.selection.reserve.clear();
                break;
            case 'ArrowLeft':
                this.selection.swap.index = this.rackService.swapLeft(this.selection.swap.index);
                this.selection.reserve.clear();
                break;
        }
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(): void {
        if (this.isFocus) {
            return;
        }

        this.reset();
    }

    ngOnInit(): void {
        this.reset();
        this.reserveSelectionChange.emit(this.selection.reserve);
    }

    onLeftClick(position: number): void {
        this.swapSelectionIndex = position;
    }

    onRightClick(position: number): boolean {
        if (this.selection.reserve.delete(position) || this.selection.swap.index === position) {
            return false; // Ensures no context menu is showed.
        }

        this.selection.reserve.add(position);

        return false; // Ensures no context menu is showed.
    }

    onMousewheel(event: WheelEvent): void {
        this.swapSelectionIndex =
            event.deltaY < 0 ? this.rackService.mod(this.selection.swap.index + 1) : this.rackService.mod(this.selection.swap.index - 1);
    }

    reset(): void {
        this.selection.swap.index = -1;
        this.selection.swap.lastIndex = 0;
        this.selection.reserve.clear();
    }

    retrievePoints(letter: string): number {
        const currentLetterData = LETTER_DEFINITIONS.get(letter);

        return currentLetterData ? currentLetterData.points : -1;
    }

    clearExchange(): void {
        this.selection.reserve.clear();
    }

    exchangeLetters(): void {
        const lettersToExchange = [];

        for (const value of this.selection.reserve) {
            lettersToExchange.push(this.rackService.rack[value]);
        }

        const sendLettersToExchange = lettersToExchange.join('');
        const command = '!échanger ' + sendLettersToExchange;
        this.commandService.parseInput(command);
        this.clearExchange();
    }

    private handleKeyPress(key: string): void {
        if (key.length !== 1 || !key.match('([a-z]|\\*)')) {
            return;
        }

        const index = this.rackService.indexOf(key, this.selection.swap.lastIndex);

        if (index !== -1 && this.isFocus) {
            this.swapSelectionIndex = index;
            this.selection.swap.lastIndex = index + 1;
            return;
        }

        this.reset();
    }

    private set swapSelectionIndex(position: number) {
        this.selection.reserve.delete(position);
        this.selection.swap.index = position;
    }
}
