import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/compiler';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EndGameComponent } from './end-game.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';

describe('EndGameComponent', () => {
    let component: EndGameComponent;
    let fixture: ComponentFixture<EndGameComponent>;
    let gameService: GameService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, AppMaterialModule],
            declarations: [EndGameComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EndGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameService = TestBed.inject(GameService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show the right string if firstPlayer have more point when winner is called', () => {
        gameService.firstPlayerStats.points = 10;
        gameService.secondPlayerStats.points = 0;
        gameService.gameConfig.firstPlayerName = 'Michel';
        gameService.gameConfig.secondPlayerName = 'Jean-Simon';
        const message = component.winner();
        expect(message).toBe(
            'Félicitation au gagnant ' + gameService.gameConfig.firstPlayerName + ':' + gameService.firstPlayerStats.points + ' points',
        );
    });

    it('should show the right string if secondPlayer have more point when winner is called', () => {
        gameService.firstPlayerStats.points = 0;
        gameService.secondPlayerStats.points = 10;
        gameService.gameConfig.firstPlayerName = 'Michel';
        gameService.gameConfig.secondPlayerName = 'Jean-Simon';
        const message = component.winner();
        expect(message).toBe(
            'Félicitation au gagnant ' + gameService.gameConfig.secondPlayerName + ':' + gameService.secondPlayerStats.points + ' points',
        );
    });

    it('should show the right string if equality occurs when winner is called', () => {
        gameService.firstPlayerStats.points = 10;
        gameService.secondPlayerStats.points = 10;
        gameService.gameConfig.firstPlayerName = 'Michel';
        gameService.gameConfig.secondPlayerName = 'Jean-Simon';
        const message = component.winner();
        expect(message).toBe(
            'Félicitation aux gagnants ' + gameService.gameConfig.firstPlayerName + ' et ' + gameService.gameConfig.secondPlayerName + ' égalité',
        );
    });
});
