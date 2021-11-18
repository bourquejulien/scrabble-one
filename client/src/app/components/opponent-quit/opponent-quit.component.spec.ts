import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpponentQuitComponent } from './opponent-quit.component';

describe('OpponentQuitComponent', () => {
    let component: OpponentQuitComponent;
    let fixture: ComponentFixture<OpponentQuitComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OpponentQuitComponent],
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
