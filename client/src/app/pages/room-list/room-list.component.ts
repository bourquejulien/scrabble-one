import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from '@app/services/room/room.service';
import { Subscription } from 'rxjs';
import { AvailableGameConfig } from '@common';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'app-room-list',
    animations: [
        trigger('slideAnimation', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('200ms', style({ transform: 'translateX(0)', opacity: 1 })),
            ]),
            transition(':leave', [
                style({ transform: 'translateX(0)', opacity: 1 }),
                animate('200ms', style({ transform: 'translateX(100%)', opacity: 0 })),
            ]),
        ]),
    ],
    templateUrl: './room-list.component.html',
    styleUrls: ['./room-list.component.scss'],
})
export class RoomListComponent implements AfterViewInit, OnDestroy {
    availableGameConfigs: AvailableGameConfig[];
    selectedConfig: AvailableGameConfig | null;
    playerName: string;
    isNameValid: boolean;
    areTilesOnFocus: boolean;

    private roomSubscription: Subscription;

    constructor(readonly roomService: RoomService, private router: Router) {
        this.availableGameConfigs = [];
        this.selectedConfig = null;
        this.isNameValid = true;
    }

    ngAfterViewInit(): void {
        this.roomService.init();
        this.roomService.refresh();
        this.roomSubscription = this.roomService.onAvailable.subscribe((configs) => this.refreshConfig(configs));
    }

    ngOnDestroy() {
        this.roomSubscription.unsubscribe();
    }

    async join() {
        if (this.selectedConfig == null) {
            return;
        }

        await this.roomService.join({ sessionId: this.selectedConfig.id, playerName: this.playerName });
        await this.router.navigate(['game']);
    }

    private refreshConfig(availableGameConfigs: AvailableGameConfig[]) {
        this.availableGameConfigs = availableGameConfigs;

        if (this.selectedConfig !== null && this.availableGameConfigs.findIndex((c) => c.id === this.selectedConfig?.id) === -1) {
            this.selectedConfig = null;
        }
    }
}
