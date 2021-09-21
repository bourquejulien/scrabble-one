// Modules
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
// Components
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
// Page components
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
<<<<<<< HEAD
import { CommunicationBoxComponent } from './components/communication-box/communication-box.component';
=======
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { RackComponent } from './components/rack/rack.component';
import { InitSoloModeComponent } from './components/init-solo-mode/init-solo-mode.component';
>>>>>>> 62672d5784c46ef255764eefb77e026433932d09
import { GameModePageComponent } from './pages/game-mode-page/game-mode-page.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
<<<<<<< HEAD
    declarations: [AppComponent, GamePageComponent, MainPageComponent, PlayAreaComponent, GameModePageComponent, CommunicationBoxComponent],
=======
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        MaterialPageComponent,
        PlayAreaComponent,
        SidebarComponent,
        RackComponent,
        InitSoloModeComponent,
        GameModePageComponent,
    ],
>>>>>>> 62672d5784c46ef255764eefb77e026433932d09
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
