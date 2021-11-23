import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { TimePipe } from './classes/time/time.pipe';
import { BoardComponent } from './components/board/board.component';
import { CommunicationBoxComponent } from './components/communication-box/communication-box.component';
import { ConfirmQuitDialogComponent } from './components/confirm-quit-dialog/confirm-quit-dialog.component';
import { EndGameComponent } from './components/end-game/end-game.component';
import { InitGameComponent } from './components/init-game/init-game.component';
import { ObjectivesComponent } from './components/objectives/objectives.component';
import { OpponentQuitComponent } from './components/opponent-quit/opponent-quit.component';
import { RackComponent } from './components/rack/rack.component';
import { SizeSelectorComponent } from './components/size-selector/size-selector.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { GameModePageComponent } from './pages/game-mode-page/game-mode-page.component';
import { RoomListComponent } from './pages/room-list/room-list.component';
import { WaitingRoomPageComponent } from './pages/waiting-room-page/waiting-room-page.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        GameModePageComponent,
        MainPageComponent,
        PlayAreaComponent,
        GameModePageComponent,
        CommunicationBoxComponent,
        RackComponent,
        SizeSelectorComponent,
        TimePipe,
        ConfirmQuitDialogComponent,
        EndGameComponent,
        WaitingRoomPageComponent,
        RoomListComponent,
        InitGameComponent,
        BoardComponent,
        ToolbarComponent,
        OpponentQuitComponent,
        ObjectivesComponent,
    ],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
