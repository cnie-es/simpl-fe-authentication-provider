import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CredentialsComponent} from './credentials.component';
import {TranslateModule} from '@ngx-translate/core';

describe('CredentialsComponent', () => {
  let component: CredentialsComponent;
  let fixture: ComponentFixture<CredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CredentialsComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

    it('should close dialog and emit event when role is "confirm"', () => {
        const emitSpy = jest.spyOn(component.credentialsUploaded, 'emit');

        component.onDialogClose({role: 'confirm'});

        expect(component.isDialogUploadOpen()).toBe(false);
        expect(emitSpy).toHaveBeenCalled();
        emitSpy.mockRestore();
    });

    it('should close dialog and not emit event when role is "cancel"', () => {
        const emitSpy = jest.spyOn(component.credentialsUploaded, 'emit');

        component.onDialogClose({role: 'cancel'});

        expect(component.isDialogUploadOpen()).toBe(false);
        expect(emitSpy).not.toHaveBeenCalled();
        emitSpy.mockRestore();
    });
});
