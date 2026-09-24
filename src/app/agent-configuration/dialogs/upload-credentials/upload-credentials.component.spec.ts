import {ComponentFixture, TestBed} from '@angular/core/testing';
import {UploadCredentialsComponent} from './upload-credentials.component';
import {TranslateModule} from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import {AgentConfigurationService} from '../../agent-configuration.service';
import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import {
  EuiDialogComponent,
  EuiDialogService,
} from '@eui/components/eui-dialog';

describe('UploadCredentialsComponent', () => {
  let component: UploadCredentialsComponent;
  let fixture: ComponentFixture<UploadCredentialsComponent>;
  let agentConfigurationServiceMock: any;
  let mockDialogClose$: Subject<void>;
  let mockEuiDialogComponent: Partial<EuiDialogComponent>;

  beforeEach(async () => {
    agentConfigurationServiceMock = {
      uploadCredentials: jest.fn(),
    };
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

    await TestBed.configureTestingModule({
      imports: [UploadCredentialsComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: AgentConfigurationService,
          useValue: agentConfigurationServiceMock,
        },
        { provide: EuiDialogService, useValue: { openDialog: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate form as valid when all fields are filled', () => {
    component.form.patchValue({
      file: 'Test' as any,
      reason: 'test'
    });

    expect(component.form.valid).toBe(true);
  });

  it('should open the dialog on initialization', () => {
    const dialogSpy = jest.spyOn(component.dialog(), 'openDialog');
    component.ngAfterViewInit();
    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should emit cancel role when dialog closes without confirmation', () => {
    const emitSpy = jest.spyOn(component.dialogClose, 'emit');
    component.ngAfterViewInit();
    component.dialog().dialogClose.emit();
    expect(emitSpy).toHaveBeenCalledWith({ role: 'cancel' });
  });

});
