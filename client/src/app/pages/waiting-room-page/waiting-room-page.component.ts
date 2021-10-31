import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from '@app/services/room/room.service';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent {
    availableRooms: string[] = [];
    constructor(readonly roomService: RoomService, private router: Router) {}

    async abandon() {
        // TODO
        await this.router.navigate(['home']);
    }

    convertToSoloMode() {
        // TODO
    }
}
