/* eslint-disable dot-notation */
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

describe('VirtualPlayerNameComponent', () => {
    let updateSubject: BehaviorSubject<VirtualPlayerName[]>;
    let adminServiceMock: AdminService;
    let component: VirtualPlayerNameComponent;
    let fixture: ComponentFixture<VirtualPlayerNameComponent>;
    let playerNameList: VirtualPlayerName[];

    beforeEach(async () => {
        updateSubject = new BehaviorSubject<VirtualPlayerName[]>([]);
        adminServiceMock = jasmine.createSpyObj('AdminService', ['updatePlayerName'], { onVirtualPlayerUpdate: updateSubject.asObservable() });
        playerNameList = [
            {
                name: 'Sailor Moon',
                level: VirtualPlayerLevel.Easy,
                isReadonly: true,
            },
            {
                name: 'Sailor Mars',
                level: VirtualPlayerLevel.Expert,
                isReadonly: true,
            },
            {
                name: 'Vegeta',
                level: VirtualPlayerLevel.Expert,
                isReadonly: true,
            },
        ];

        // const playerNameServiceMock = {
        //     of({playerNames: playerNameList}, updatedNameList);
        // };

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
        component.ngOnDestroy();
        expect(spy).toHaveBeenCalled();
    });

    it('should not change player name', () => {
        // TO DO: FIND GOOD TEST NAME
        component.nameValidator.name = 'Chariot Requiem';

        const virtPlayerName: VirtualPlayerName = {
            name: 'Jean Pierre Polnareff',
            level: VirtualPlayerLevel.Easy,
            isReadonly: true,
        };

        component.select(virtPlayerName);
        expect(component.nameValidator.name).toBe('Chariot Requiem');
    });

    it('should change player name', () => {
        // TO DO: FIND GOOD TEST NAME
        component.nameValidator.name = 'Chariot Requiem';

        const virtPlayerName: VirtualPlayerName = {
            name: 'Jean Pierre Polnareff',
            level: VirtualPlayerLevel.Easy,
            isReadonly: false,
        };

        component.select(virtPlayerName);
        expect(component.nameValidator.name).toBe('Jean Pierre Polnareff');
    });

    it('should reset validator if player name valid', () => {
        component.nameValidator.name = 'King Crimson';
        component.add();
        expect(component.nameValidator.name).toBe('');
    });

    it('should change player name if name valid and not in bot names list', () => {
        const virtPlayerName: VirtualPlayerName = {
            name: 'Jean Pierre Polnareff',
            level: VirtualPlayerLevel.Easy,
            isReadonly: false,
        };
        const spy = spyOn(component.playerNameService, 'updatePlayerName');

        spyOnProperty(component.nameValidator, 'isValid').and.returnValue(true);
        component.playerNames = playerNameList;
        component.nameValidator.name = 'ZaWarudo';
        component.originName = virtPlayerName;

        component.changeName();
        expect(spy).toHaveBeenCalled();
    });

    it('should not change player name if name invalid', () => {
        const spy = spyOn(component.playerNameService, 'updatePlayerName');
        spyOnProperty(component.nameValidator, 'isValid').and.returnValue(false);

        component.changeName();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should not change player name if name in bot name list', () => {
        const spy = spyOn(component.playerNameService, 'updatePlayerName');
        spyOnProperty(component.nameValidator, 'isValid').and.returnValue(true);
        component.playerNames = playerNameList;
        component.nameValidator.name = 'Vegeta';

        component.changeName();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should reset names before updating them', () => {
        const updatedNameList: VirtualPlayerName[] = [
            {
                name: 'Future Trunks',
                level: VirtualPlayerLevel.Easy,
                isReadonly: true,
            },
        ];

        component.playerNames.concat(updatedNameList);

        component.playerNameService.onVirtualPlayerUpdate.subscribe((playerNames) => {
            component['playerNamesUpdated'](playerNames);
        });

        const spy = spyOn(component, 'reset');

        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });
});
