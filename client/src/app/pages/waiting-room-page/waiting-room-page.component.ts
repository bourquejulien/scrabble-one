import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from '@app/services/room/room.service';
import { Subscription } from 'rxjs';
import { LocationStrategy } from '@angular/common';
import { Constants } from '@app/constants/global.constants';
import { VirtualPlayerLevel } from '@common';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnDestroy, OnInit {
    virtualPlayerLevelName: string;
    readonly virtualPlayerLevelNames: string[];
    private roomSubscription: Subscription;

    constructor(private readonly roomService: RoomService, private readonly router: Router, location: LocationStrategy, elementRef: ElementRef) {
        this.virtualPlayerLevelNames = Constants.VIRTUAL_PLAYERS_LEVELS_NAMES;
        this.virtualPlayerLevelName = this.virtualPlayerLevelNames[0];
        location.onPopState(() => {
            // Won't test this callback: simply too advanced
            if (elementRef.nativeElement.offsetParent != null) {
                this.abort();
            }
        });
    }

    ngOnInit() {
        this.roomSubscription = this.roomService.onGameFull.subscribe(async () => this.nextPage());
    }

    ngOnDestroy() {
        this.roomSubscription.unsubscribe();
    }

    async abort() {
        await this.roomService.abort();
        await this.router.navigate(['settings']);
    }

    async convertToSoloMode() {
        await this.roomService.toSinglePlayer(
            this.virtualPlayerLevelNames[0] === this.virtualPlayerLevelName ? VirtualPlayerLevel.Easy : VirtualPlayerLevel.Expert,
        );
    }

    private async nextPage() {
        await this.router.navigate(['game']);
    }
}
