import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameModePageComponent } from '@app/pages/game-mode-page/game-mode-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { WaitingRoomPageComponent } from '@app/pages/waiting-room-page/waiting-room-page.component';
import { RoomListComponent } from '@app/pages/room-list/room-list.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'settings', component: GameModePageComponent },
    { path: 'waiting-room', component: WaitingRoomPageComponent },
    { path: 'room-list', component: RoomListComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
