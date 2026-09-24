import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenerateKeypairComponent } from './generate-keypair.component';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { of, Subject, throwError } from 'rxjs';
import {
  EuiDialogComponent,
  EuiDialogService,
} from '@eui/components/eui-dialog';
import { AgentConfigurationService } from '../../agent-configuration.service';
import { HttpErrorResponse } from '@angular/common/http';

describe('GenerateKeypairComponent', () => {
  let component: GenerateKeypairComponent;
  let fixture: ComponentFixture<GenerateKeypairComponent>;
  let mockDialogClose$: Subject<void>;
  let mockEuiDialogComponent: Partial<EuiDialogComponent>;
  let agentConfigurationServiceMock: jest.Mocked<AgentConfigurationService>;

  beforeEach(async () => {
    mockDialogClose$ = new Subject<void>();
    mockEuiDialogComponent = {
      openDialog: jest.fn(),

      enableAcceptButton: jest.fn(),
      enableDismissButton: jest.fn(),
      disableAcceptButton: jest.fn(),
      disableDismissButton: jest.fn(),
      dialogClose: mockDialogClose$.asObservable() as any,
      closeDialog: jest.fn(),
    };

    agentConfigurationServiceMock = {
      generateKeypairV2: jest.fn().mockReturnValue(of({
        "creationTimestamp": "2025-01-23T04:56:07Z",
        "name": "my keypair",
        "active": false,
        "id": "046b6c7f-0b8a-43b9-b35d-6489e6daee91",
        "publicKey": "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEn6Htd4aaqQ2fmKLhuCz0aLKha31P\nXGMddh8bvMUPFGnUT1ZcRBh+323bzbnu4hZsToMYdYLwz6fOM3C07eiMeA==\n-----END PUBLIC KEY-----"
      })) as any,
    } as jest.Mocked<AgentConfigurationService>;

    await TestBed.configureTestingModule({
      imports: [GenerateKeypairComponent, TranslateModule.forRoot(), ReactiveFormsModule],
      providers: [
        { provide: EuiDialogService, useValue: {} },
        { provide: EuiDialogComponent, useValue: mockEuiDialogComponent },
        { provide: AgentConfigurationService, useValue: agentConfigurationServiceMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GenerateKeypairComponent);
    component = fixture.componentInstance;
    component.dialog = jest.fn(() => mockEuiDialogComponent as any) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call openDialog in ngAfterViewInit', () => {
    component.ngAfterViewInit();
    expect(mockEuiDialogComponent.openDialog).toHaveBeenCalled();
  });

  it('should enable the accept button when form is valid', () => {
    component.ngAfterViewInit();
    component.form.controls['name'].setValue('Valid Name');
    expect(mockEuiDialogComponent.enableAcceptButton).toHaveBeenCalled();
  });

  it('should disable the accept button when form is invalid', () => {
    component.ngAfterViewInit();
    component.form.controls['name'].setValue('');
    expect(mockEuiDialogComponent.disableAcceptButton).toHaveBeenCalled();
  });

  it('should emit dialogClose with cancel role when dialogClose observable emits', () => {
    jest.spyOn(component.dialogClose, 'emit');
    component.ngAfterViewInit();
    mockDialogClose$.next();
    expect(component.dialogClose.emit).toHaveBeenCalledWith({ role: 'cancel' });
  });

  it('should set loading to true, close dialog, and emit confirm role when onAccept is called', (done) => {
    jest.spyOn(component.dialogClose, 'emit');
    jest.spyOn(mockEuiDialogComponent, 'closeDialog');

    component.onAccept();

    setTimeout(() => {
    expect(component.loading()).toBe(true);
      expect(mockEuiDialogComponent.closeDialog).toHaveBeenCalled();
      expect(component.dialogClose.emit).toHaveBeenCalledWith({ role: 'confirm' });
      done();
    }, 100);
  });

  it('should reenable buttons and set loading to false when onAccept is called but api gives error', (done) => {
    jest.spyOn(component.dialogClose, 'emit');
    jest.spyOn(mockEuiDialogComponent, 'closeDialog');

    jest.spyOn(agentConfigurationServiceMock, 'generateKeypairV2').mockReturnValue(throwError(() => new HttpErrorResponse({status: 400})));

    component.onAccept();

    setTimeout(() => {
      expect(component.loading()).toBe(false);
      expect(mockEuiDialogComponent.closeDialog).not.toHaveBeenCalled();
      expect(mockEuiDialogComponent.enableAcceptButton).toHaveBeenCalled();
      expect(mockEuiDialogComponent.enableDismissButton).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should reenable buttons, set loading to false and close dialog when onAccept is called but api gives 500 error', (done) => {
    jest.spyOn(component.dialogClose, 'emit');
    jest.spyOn(mockEuiDialogComponent, 'closeDialog');

    jest.spyOn(agentConfigurationServiceMock, 'generateKeypairV2').mockReturnValue(throwError(() => new HttpErrorResponse({status: 500})));

    component.onAccept();

    setTimeout(() => {
      expect(mockEuiDialogComponent.enableAcceptButton).toHaveBeenCalled();
      expect(mockEuiDialogComponent.enableDismissButton).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
      expect(mockEuiDialogComponent.closeDialog).toHaveBeenCalled();
      done();
    }, 100);
  });
});
