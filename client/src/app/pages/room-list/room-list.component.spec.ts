import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RoomListComponent } from './room-list.component';

describe('RoomListComponent', () => {
    let component: RoomListComponent;
    let fixture: ComponentFixture<RoomListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RoomListComponent],
            imports: [RouterTestingModule.withRoutes([])],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RoomListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
