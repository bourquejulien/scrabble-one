import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VirtualPlayerNameComponent } from './virtual-player-name.component';
import { AdminService } from '@app/services/admin/admin.service';
import { BehaviorSubject } from 'rxjs';
import { VirtualPlayerName } from '@common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSliderModule } from '@angular/material/slider';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

describe('VirtualPlayerNameComponent', () => {
    let updateSubject: BehaviorSubject<VirtualPlayerName[]>;
    let adminServiceMock: AdminService;
    let component: VirtualPlayerNameComponent;
    let fixture: ComponentFixture<VirtualPlayerNameComponent>;

    beforeEach(async () => {
        updateSubject = new BehaviorSubject<VirtualPlayerName[]>([]);
        adminServiceMock = jasmine.createSpyObj('AdminService', ['updatePlayerName'], { onVirtualPlayerUpdate: updateSubject.asObservable() });

        await TestBed.configureTestingModule({
            declarations: [VirtualPlayerNameComponent],
            providers: [{ provider: AdminService, useValue: adminServiceMock }],
            imports: [HttpClientTestingModule, MatSliderModule, MatListModule, MatSlideToggleModule, MatIconModule, FormsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(VirtualPlayerNameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
