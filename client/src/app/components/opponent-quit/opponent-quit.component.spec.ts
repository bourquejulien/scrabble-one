import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameService } from '@app/services/game/game.service';
import { OpponentQuitComponent } from './opponent-quit.component';
@Injectable({
    providedIn: 'root',
})
class MatDialogStub {
    close() {
        // Does Nothing
    }
}

describe('OpponentQuitComponent', () => {
    let component: OpponentQuitComponent;
    let fixture: ComponentFixture<OpponentQuitComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['reset']);
        await TestBed.configureTestingModule({
            declarations: [OpponentQuitComponent],
            imports: [ HttpClientTestingModule, MatDialogModule ],
            providers: [ 
                { provide: MatDialogRef, useClass: MatDialogStub },
                { provide: GameService, useValue: gameServiceSpy},
                { provide: MAT_DIALOG_DATA, useValue: {}}, 
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OpponentQuitComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

});

