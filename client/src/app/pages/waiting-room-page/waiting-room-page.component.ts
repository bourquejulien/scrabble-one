import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from '@app/services/room/room.service';
import { Subscription } from 'rxjs';
import { LocationStrategy } from '@angular/common';
import { Constants } from '@app/constants/global.constants';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnDestroy, OnInit {
    readonly gameTypesList: string[];
    private roomSubscription: Subscription;

    constructor(private readonly roomService: RoomService, private readonly router: Router, location: LocationStrategy, elementRef: ElementRef) {
        this.gameTypesList = Constants.GAME_TYPES_LIST;
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
        await this.roomService.toSinglePlayer();
    }

    private async nextPage() {
        await this.router.navigate(['game']);
    }
}
