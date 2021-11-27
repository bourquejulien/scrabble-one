import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BestScoresComponent } from './best-scores.component';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

describe('BestScoresComponent', () => {
    let component: BestScoresComponent;
    let fixture: ComponentFixture<BestScoresComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
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
});
