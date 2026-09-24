import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportKeypairComponent } from './import-keypair.component';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import {
  EuiDialogComponent,
  EuiDialogService,
} from '@eui/components/eui-dialog';
import { ComponentRef } from '@angular/core';
import { mockedKeyPairsAlgorithm } from '../../mocks/data';
import { AgentConfigurationService } from '../../agent-configuration.service';
import { HttpErrorResponse } from '@angular/common/http';

describe('ImportKeypairComponent', () => {
  let component: ImportKeypairComponent;
  let fixture: ComponentFixture<ImportKeypairComponent>;
  let componentRef: ComponentRef<ImportKeypairComponent>;
  let mockDialogClose$: Subject<void>;
  let mockEuiDialogComponent: Partial<EuiDialogComponent>;
  let agentConfigurationServiceMock: jest.Mocked<AgentConfigurationService>;

  beforeEach(async () => {
    agentConfigurationServiceMock = {
      importKeyPairV2: jest.fn().mockReturnValue(of({
        "name": "my keypair",
        "id": "046b6c7f-0b8a-43b9-b35d-6489e6daee91",
        "publicKey": "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEn6Htd4aaqQ2fmKLhuCz0aLKha31P\nXGMddh8bvMUPFGnUT1ZcRBh+323bzbnu4hZsToMYdYLwz6fOM3C07eiMeA==\n-----END PUBLIC KEY-----",
        "creationTimestamp": "2025-01-23T04:56:07.000+00:00",
        "active": false
      })) as any,
    } as jest.Mocked<AgentConfigurationService>;
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
      imports: [ImportKeypairComponent, TranslateModule.forRoot()],
      providers: [
        { provide: EuiDialogService, useValue: {} },
        { provide: EuiDialogComponent, useValue: mockEuiDialogComponent },
        { provide: AgentConfigurationService, useValue: agentConfigurationServiceMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImportKeypairComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('keyPairAlgorithm', mockedKeyPairsAlgorithm);
    component.dialog = jest.fn(() => mockEuiDialogComponent as any) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the dialog when ngAfterViewInit is called', () => {
    const dialogSpy = jest.spyOn(component.dialog(), 'openDialog');
    component.ngAfterViewInit();
    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should emit cancel when dialog close event is triggered', () => {
    const dialogCloseSpy = jest.spyOn(component.dialogClose, 'emit');
    component.ngAfterViewInit();
    mockDialogClose$.next();
    expect(dialogCloseSpy).toHaveBeenCalledWith({ role: 'cancel' });
  });

  it('should enable or disable accept button based on form validity', () => {
    const enableAcceptButtonSpy = jest.spyOn(component.dialog(), 'enableAcceptButton');
    const disableAcceptButtonSpy = jest.spyOn(component.dialog(), 'disableAcceptButton');
    component.ngAfterViewInit();

    component.importForm.controls['name'].setValue('Test');
    component.importForm.controls['privateKey'].setValue('Private Key');
    component.importForm.controls['publicKey'].setValue('Public Key');
    expect(enableAcceptButtonSpy).toHaveBeenCalled();

    component.importForm.controls['name'].setValue('');
    expect(disableAcceptButtonSpy).toHaveBeenCalled();
  });

  it('should clear and enable private key fields when onFileDeleted is called with "private"', () => {
    component.privateKeyUploaded.set(true);
    component.privateFileInfo.set({ name: 'private-key.pem', size: 1024 });
    component.importForm.patchValue({ privateKey: 'Private Key Content' });
    component.importForm.get('privateKey')?.disable();

    component.onFileDeleted('private');

    expect(component.importForm.get('privateKey')?.value).toBe('');
    expect(component.importForm.get('privateKey')?.enabled).toBe(true);
    expect(component.privateKeyUploaded()).toBe(false);
    expect(component.privateFileInfo()).toEqual({ name: null, size: null });
  });

  it('should clear and enable public key fields when onFileDeleted is called with "public"', () => {
    component.publicKeyUploaded.set(true);
    component.publicFileInfo.set({ name: 'public-key.pem', size: 2048 });
    component.importForm.patchValue({ publicKey: 'Public Key Content' });
    component.importForm.get('publicKey')?.disable();

    component.onFileDeleted('public');

    expect(component.importForm.get('publicKey')?.value).toBe('');
    expect(component.importForm.get('publicKey')?.enabled).toBe(true);
    expect(component.publicKeyUploaded()).toBe(false);
    expect(component.publicFileInfo()).toEqual({ name: null, size: null });
  });

  describe('onFileUploaded', () => {
    it('should handle file upload for privateKey', () => {
      const file = new File(['private-key-content'], 'private-key.pem', { type: 'text/plain' });
      const event = { target: { files: [file] } } as unknown as Event;

      const fileReaderMock = {
        readAsText: jest.fn(),
        onload: jest.fn(),
      };

      jest.spyOn(window, 'FileReader').mockImplementation(() => fileReaderMock as unknown as FileReader);

      component.onFileUploaded(event, 'private');
      expect(fileReaderMock.readAsText).toHaveBeenCalledWith(file);

      Object.defineProperty(fileReaderMock, 'result', {
        value: 'private-key-content',
        writable: true,
      });
      fileReaderMock.onload!({} as ProgressEvent);

      expect(component.importForm.get('privateKey')?.value).toBe('private-key-content');
      expect(component.privateKeyUploaded()).toBe(true);
      expect(component.privateFileInfo()).toEqual({ name: 'private-key.pem', size: file.size });
    });
    it('should handle file upload for publicKey', () => {
      const file = new File(['public-key-content'], 'public-key.pem', { type: 'text/plain' });
      const event = { target: { files: [file] } } as unknown as Event;

      const fileReaderMock = {
        readAsText: jest.fn(),
        onload: jest.fn(),
      };

      jest.spyOn(window, 'FileReader').mockImplementation(() => fileReaderMock as unknown as FileReader);

      component.onFileUploaded(event, 'public');
      expect(fileReaderMock.readAsText).toHaveBeenCalledWith(file);

      Object.defineProperty(fileReaderMock, 'result', {
        value: 'public-key-content',
        writable: true,
      });
      fileReaderMock.onload!({} as ProgressEvent);

      expect(component.importForm.get('publicKey')?.value).toBe('public-key-content');
      expect(component.publicKeyUploaded()).toBe(true);
      expect(component.publicFileInfo()).toEqual({ name: 'public-key.pem', size: file.size });
    });
  })


  it('should emit dialogClose with cancel role', () => {
    jest.spyOn(component.dialogClose, 'emit');
    component.ngAfterViewInit();
    mockDialogClose$.next();
    expect(component.dialogClose.emit).toHaveBeenCalledWith({ role: 'cancel' });
  });

  it('should  emit confirm role when onAccept is called', (done) => {
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

  it('should reenable buttons when onAccept is called but api gives error', (done) => {
    jest.spyOn(component.dialogClose, 'emit');
    jest.spyOn(mockEuiDialogComponent, 'closeDialog');
    jest.spyOn(agentConfigurationServiceMock, 'importKeyPairV2').mockReturnValue(throwError(() => new HttpErrorResponse({status: 400})));

    component.onAccept();

    setTimeout(() => {
      expect(component.loading()).toBe(false);
      expect(mockEuiDialogComponent.closeDialog).not.toHaveBeenCalled();
      expect(component.dialog().enableAcceptButton).toHaveBeenCalled();
      expect(component.dialog().enableDismissButton).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should reenable buttons and close dialog when onAccept is called but api gives 500 error', (done) => {
    jest.spyOn(component.dialogClose, 'emit');
    jest.spyOn(mockEuiDialogComponent, 'closeDialog');
    jest.spyOn(agentConfigurationServiceMock, 'importKeyPairV2').mockReturnValue(throwError(() => new HttpErrorResponse({status: 500})));

    component.onAccept();

    setTimeout(() => {
      expect(component.loading()).toBe(false);
      expect(component.dialog().enableAcceptButton).toHaveBeenCalled();
      expect(component.dialog().enableDismissButton).toHaveBeenCalled();
      expect(mockEuiDialogComponent.closeDialog).toHaveBeenCalled();
      done();
    }, 100);
  });

  describe('copyToClipboard', () => {
    it('should call navigator.clipboard.writeText with the codeInstructions content', () => {
      const codeInstructions = component.codeInstructions;
      const mockWriteText = jest.fn().mockResolvedValue(codeInstructions);
      Object.assign(navigator, { clipboard: { writeText: mockWriteText } });

      component.copyToClipboard();

      expect(mockWriteText).toHaveBeenCalledWith(codeInstructions);
    });
  });


});
