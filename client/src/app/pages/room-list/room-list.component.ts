import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from '@app/services/room/room.service';

@Component({
    selector: 'app-room-list',
    templateUrl: './room-list.component.html',
    styleUrls: ['./room-list.component.scss'],
})
export class RoomListComponent implements OnInit {
    constructor(readonly roomService: RoomService, private router: Router) {}

    ngOnInit(): void {
        this.roomService.refresh();
    }

    async join(roomId: string) {
        await this.roomService.join(roomId);
        await this.router.navigate(['game']);
    }
}
