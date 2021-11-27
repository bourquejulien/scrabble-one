/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { BestScoresComponent } from '@app/components/best-scores/best-scores.component';
import { ScoreboardService } from '@app/services/scoreboard/scoreboard.service';
import { Score } from '@common';

describe('BestScoresComponent', () => {
    let component: BestScoresComponent;
    let fixture: ComponentFixture<BestScoresComponent>;
    let scoreboardServiceSpy: jasmine.SpyObj<ScoreboardService>;

    const classicScore: Score[] = [
        { name: 'Albert', scoreValue: 10 },
        { name: 'Tristan', scoreValue: 15 },
    ];

    const logScore: Score[] = [
        { name: 'Bruce', scoreValue: 20 },
        { name: 'Wayne', scoreValue: 25 },
    ];

    beforeEach(async () => {
        scoreboardServiceSpy = jasmine.createSpyObj('ScoreboardService', ['displayScores']);
        await TestBed.configureTestingModule({
            providers: [{ provide: ScoreboardService, useValue: scoreboardServiceSpy }],
            declarations: [BestScoresComponent],
            imports: [HttpClientTestingModule, MatTableModule, MatIconModule, MatDialogModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BestScoresComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should correctly initialize data for classic board', async () => {
        scoreboardServiceSpy['displayScores'].and.resolveTo(classicScore);
        await component.initBoards();
        scoreboardServiceSpy['displayScores'].and.callThrough();

        expect(component['classicBoardData']).toEqual(classicScore);
    });

    it('should correctly initialize data for log board', async () => {
        scoreboardServiceSpy['displayScores'].and.resolveTo(logScore);
        await component.initBoards();
        scoreboardServiceSpy['displayScores'].and.callThrough();

        expect(component['logBoardData']).toEqual(logScore);
    });
});
