import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from '@app/services/room/room.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnDestroy, OnInit {
    availableRooms: string[] = [];
    private roomSubscription: Subscription;

    constructor(readonly roomService: RoomService, private router: Router) {}

    ngOnInit() {
        this.roomSubscription = this.roomService.onGameFull.subscribe(() => this.nextPage());
    }

    ngOnDestroy() {
        this.roomSubscription.unsubscribe();
    }

    async abandon() {
        // TODO
        await this.router.navigate(['home']);
    }

    convertToSoloMode() {
        // TODO
    }

    private nextPage() {
        this.router.navigate(['game']);
    }
}
