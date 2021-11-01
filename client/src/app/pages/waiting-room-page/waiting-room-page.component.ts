import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from '@app/services/room/room.service';
import { Subscription } from 'rxjs';
import { LocationStrategy } from '@angular/common';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnDestroy, OnInit {
    private roomSubscription: Subscription;

    constructor(readonly roomService: RoomService, private router: Router, location: LocationStrategy, elementRef: ElementRef) {
        history.pushState(null, '', window.location.href);
        location.onPopState(() => {
            if (elementRef.nativeElement.offsetParent != null) {
                this.abort();
                history.pushState(null, '', window.location.href);
            }
        });
    }

    ngOnInit() {
        this.roomSubscription = this.roomService.onGameFull.subscribe(() => this.nextPage());
    }

    ngOnDestroy() {
        this.roomSubscription.unsubscribe();
    }

    async abort() {
        await this.roomService.abort();
        await this.router.navigate(['settings']);
    }

    convertToSoloMode() {
        // TODO
    }

    private nextPage() {
        this.router.navigate(['game']);
    }
}
