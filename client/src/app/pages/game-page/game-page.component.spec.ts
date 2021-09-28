/* eslint-disable max-classes-per-file -- Needs many stub implementations */
import { CUSTOM_ELEMENTS_SCHEMA, Injectable, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbar } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameConfig } from '@app/classes/game-config';
import { PlayerType } from '@app/classes/player-type';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Constants } from '@app/constants/global.constants';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { GridService } from '@app/services/grid/grid.service';
import { BehaviorSubject } from 'rxjs';
import { GamePageComponent } from './game-page.component';

@Injectable({
    providedIn: 'root',
})
class GridServiceStub {
    // eslint-disable-next-line no-unused-vars -- Its a stub, implemented to do nothing
    drawGrid(canvas: CanvasRenderingContext2D): void {
        // Does nothing
    }

    // eslint-disable-next-line no-unused-vars -- Its a stub, implemented to do nothing
    drawSquares(canvas: CanvasRenderingContext2D): void {
        // Does nothing
    }
}

@Injectable({
    providedIn: 'root',
})
class GameServiceStub {
    onTurn: BehaviorSubject<PlayerType> = new BehaviorSubject<PlayerType>(PlayerType.Local);
    gameConfig: GameConfig = {
        gameType: Constants.GAME_TYPES_LIST[0],
        minutes: Constants.TURN_LENGTH_MINUTES[1],
        seconds: Constants.TURN_LENGTH_SECONDS[0],
        time: 0,
        firstPlayerName: '',
        secondPlayerName: '',
    };
}

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, PlayAreaComponent, MatToolbar],
            providers: [
                { provide: GridService, useClass: GridServiceStub },
                { provide: GameService, useClass: GameServiceStub },
            ],
            imports: [AppMaterialModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
