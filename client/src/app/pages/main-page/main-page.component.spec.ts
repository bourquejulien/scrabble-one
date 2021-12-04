import { Injectable } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { cleanStyles } from '@app/classes/helpers/cleanup.helper';
import { AppMaterialModule } from '@app/modules/material.module';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { HealthService } from '@app/services/health/health.service';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
class StubHealthService {
    isHealthy: boolean = true;

    async isServerOk(): Promise<void> {
        if (this.isHealthy) {
            return Promise.resolve();
        } else {
            throw new Error();
        }
    }
}

@Injectable({
    providedIn: 'root',
})
class MatDialogStub {
    close() {
        // Does Nothing
    }
}

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let stubbedHealthService: StubHealthService;

    beforeEach(async () => {

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, RouterTestingModule.withRoutes([{ path: 'error', component: MainPageComponent}]), AppMaterialModule],
            declarations: [MainPageComponent],
            providers: [
                { provide: HealthService, useClass: StubHealthService },
                { provide: MatDialogRef, useClass: MatDialogStub },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        // router = TestBed.inject(Router);
        stubbedHealthService = TestBed.inject(HealthService) as unknown as StubHealthService;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open dialog window when best scores button clicked', () => {
        const spy = spyOn(component.dialog, 'open').and.returnValue({
            afterClosed: () => of(true),
        } as MatDialogRef<typeof component>);

        component.openScoresDialog();
        expect(spy).toHaveBeenCalled();
    });

    it('should go to error page', fakeAsync(() => {
        stubbedHealthService.isHealthy = false;
        const spy = spyOn(component['router'], 'navigate');

        component.ngOnInit();

        expect(spy).not.toHaveBeenCalled();
    }));

    afterAll(() => cleanStyles());
});
