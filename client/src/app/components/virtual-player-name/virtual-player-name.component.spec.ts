import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { AdminService } from '@app/services/admin/admin.service';
import { VirtualPlayerLevel, VirtualPlayerName } from '@common';
import { BehaviorSubject } from 'rxjs';
import { VirtualPlayerNameComponent } from './virtual-player-name.component';

fdescribe('VirtualPlayerNameComponent', () => {
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

    it('should unsubscribe from player names once component destroyed', () => {
        const spy = spyOn(component['playerNamesSubscription'], 'unsubscribe');
        component.ngOnDestroy()
        expect(spy).toHaveBeenCalled();
    });

    it('should not change player name', () => { // TO DO: FIND GOOD TEST NAME
        component.nameValidator.name = 'Chariot Requiem';

        const virtPlayerName: VirtualPlayerName = {
            name: 'Jean Pierre Polnareff',
            level: VirtualPlayerLevel.Easy,
            isReadonly: true,
        };

        component.select(virtPlayerName);
        expect(component.nameValidator.name).toBe('Chariot Requiem');
    });

    it('should change player name', () => { // TO DO: FIND GOOD TEST NAME
        component.nameValidator.name = 'Chariot Requiem';

        const virtPlayerName: VirtualPlayerName = {
            name: 'Jean Pierre Polnareff',
            level: VirtualPlayerLevel.Easy,
            isReadonly: false,
        };

        component.select(virtPlayerName);
        expect(component.nameValidator.name).toBe('Jean Pierre Polnareff');
    });

    it('should reset validator if player name valid', () => { // TO DO: FIND GOOD TEST NAME
        component.nameValidator.name = 'King Crimson';
        component.add();
        expect(component.nameValidator.name).toBe('');
    });
});
