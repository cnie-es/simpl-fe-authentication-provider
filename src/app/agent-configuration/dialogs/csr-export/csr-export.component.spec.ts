import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CsrExportComponent } from './csr-export.component';
import { TranslateModule } from '@ngx-translate/core';
import { AgentConfigurationService } from '../../agent-configuration.service';
import { of, throwError } from 'rxjs';
import { ComponentRef } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { EuiDialogService } from '@eui/components/eui-dialog';

describe('CsrExportComponent', () => {
  let component: CsrExportComponent;
  let fixture: ComponentFixture<CsrExportComponent>;
  let componentRef: ComponentRef<CsrExportComponent>;
  let agentConfigurationServiceMock: jest.Mocked<AgentConfigurationService>;

  beforeEach(async () => {

    agentConfigurationServiceMock = {
      generateCsr: jest.fn() as any,
      extractFileName: jest.fn() as any,
      downloadDocument: jest.fn() as any,
      openGrowl: jest.fn() as any,
      requestNewCredential: jest.fn() as any
    } as jest.Mocked<AgentConfigurationService>;


    await TestBed.configureTestingModule({
      imports: [CsrExportComponent, TranslateModule.forRoot()],
      providers: [
        { provide: EuiDialogService, useValue: { openDialog: jest.fn() as any, disableAcceptButton: jest.fn() as any, disableDismissButton: jest.fn() as any, getDialog: jest.fn() as any} },
        { provide: AgentConfigurationService, useValue: agentConfigurationServiceMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CsrExportComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.csrDetailsForm).toBeDefined();
  });
  it('should validate csrDetailsForm as valid when all fields are filled', () => {
    component.csrDetailsForm.patchValue({
      commonName: 'Test Common Name',
      organization: 'Test Organization',
      organizationalUnit: 'Test Unit',
      country: 'US'
    });

    expect(component.csrDetailsForm.valid).toBe(true);
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

  describe('onAccept', () => {
    it('should handle acceptance and emit confirm role', () => {
      const openDialogSpy = jest
        .spyOn(component.dialog(), 'openDialog')
        .mockImplementation(() => {
          return {} as any;
        });
      const emitSpy = jest.spyOn(component.dialogClose, 'emit');
      const closeDialogSpy = jest.spyOn(component.dialog(), 'closeDialog');
      const generateCsrMock = jest.spyOn(agentConfigurationServiceMock, 'generateCsr').mockReturnValue(of(new HttpResponse({body: {}, headers: new HttpHeaders("test")}, )) as any);
      const enableDismissSpy = jest.spyOn(component.dialog(), 'enableDismissButton').mockImplementation(() => true);
      const disableDismissSpy = jest.spyOn(component.dialog(), 'disableDismissButton').mockImplementation(() => true);
      const enableAcceptSpy = jest.spyOn(component.dialog(), 'enableAcceptButton').mockImplementation(() => true);
      const disableAcceptSpy = jest.spyOn(component.dialog(), 'disableAcceptButton').mockImplementation(() => true);
      const extractFileNameSpy = jest.spyOn(agentConfigurationServiceMock, 'extractFileName').mockReturnValue("file.pem");
      componentRef.setInput('keypairId', 'key123');
      component.csrDetailsForm.patchValue({
        commonName: 'Test Common Name',
        organization: 'Test Organization',
        organizationalUnit: 'Test Unit',
        country: 'US'
      });

      component.onAccept();

      expect(generateCsrMock).toHaveBeenCalledWith('key123', {
        commonName: 'Test Common Name',
        organization: 'Test Organization',
        organizationalUnit: 'Test Unit',
        country: 'US'
      });
      expect(closeDialogSpy).toHaveBeenCalled();
    });

    it('should handle 500 error code', () => {
      const emitSpy = jest.spyOn(component.dialogClose, 'emit');
      const enableDismissSpy = jest.spyOn(component.dialog(), 'enableDismissButton').mockImplementation(() => true);
      const disableDismissSpy = jest.spyOn(component.dialog(), 'disableDismissButton').mockImplementation(() => true);
      const enableAcceptSpy = jest.spyOn(component.dialog(), 'enableAcceptButton').mockImplementation(() => true);
      const disableAcceptSpy = jest.spyOn(component.dialog(), 'disableAcceptButton').mockImplementation(() => true);
      const closeDialogSpy = jest.spyOn(component.dialog(), 'closeDialog');
      const generateCsrMock = jest.spyOn(agentConfigurationServiceMock, 'generateCsr').mockReturnValue(throwError(() =>  new HttpErrorResponse({status: 500})) as any);

      componentRef.setInput('keypairId', 'key123');
      component.csrDetailsForm.patchValue({
        commonName: 'Test Common Name',
        organization: 'Test Organization',
        organizationalUnit: 'Test Unit',
        country: 'US'
      });

      component.onAccept();

      expect(generateCsrMock).toHaveBeenCalledWith('key123', {
        commonName: 'Test Common Name',
        organization: 'Test Organization',
        organizationalUnit: 'Test Unit',
        country: 'US'
      });
      expect(closeDialogSpy).toHaveBeenCalled();
    });
  })


});
