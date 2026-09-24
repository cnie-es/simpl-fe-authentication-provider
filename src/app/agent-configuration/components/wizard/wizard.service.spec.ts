import { TestBed } from '@angular/core/testing';

import { WizardService } from './wizard.service';
import { AgentConfigurationService } from '../../agent-configuration.service';
import { EuiAppShellService } from '@eui/core';
import { of } from 'rxjs';
import { mockedKeyPairsResponse } from '../../mocks/data';

describe('WizardService', () => {
  let service: WizardService;
  let agentConfigurationServiceMock: jest.Mocked<AgentConfigurationService>;
  let euiAppShellServiceMock: jest.Mocked<EuiAppShellService>;


  beforeEach(() => {

    agentConfigurationServiceMock = {
      getKeyPairs: jest.fn()
    } as any;

    euiAppShellServiceMock = {
      isBlockDocumentActive: false
    } as any;



    TestBed.configureTestingModule({
      providers: [
        WizardService,
        { provide: AgentConfigurationService, useValue: agentConfigurationServiceMock },
        { provide: EuiAppShellService, useValue: euiAppShellServiceMock }
      ]

    });
    service = TestBed.inject(WizardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set activeStepIndex to KEYPAIR when no key pairs exist', (done) => {
    const emptyResponse = { items: [] };
    agentConfigurationServiceMock.getKeyPairs.mockReturnValue(of(emptyResponse) as any);

    service.getActiveWizardStepIndex().subscribe((res) => {
      expect(res).toBe(service.wizardSteps.KEYPAIR);
      expect(euiAppShellServiceMock.isBlockDocumentActive).toBe(false);
      done();
    });
  });

  it('should set activeStepIndex to CSR when key pairs exist but no CSR', (done) => {
    const responseWithoutCSR = {
      items: [{ id: '1', name: 'test-keypair' }]
    };
    agentConfigurationServiceMock.getKeyPairs.mockReturnValue(of(responseWithoutCSR) as any);

    service.getActiveWizardStepIndex().subscribe((res) => {
      expect(res).toBe(service.wizardSteps.CSR);
      done();
    });
  });

  it('should set activeStepIndex to CREDENTIALS when key pairs with CSR exist', (done) => {
    const responseWithCSR = {
      items: [{ id: '1', name: 'test-keypair', csr: 'some-csr-data' }]
    };
    agentConfigurationServiceMock.getKeyPairs.mockReturnValue(of(responseWithCSR) as any);

    service.getActiveWizardStepIndex().subscribe((res) => {
      expect(res).toBe(service.wizardSteps.CREDENTIALS);
      done();
    });
  });

  it('should call agentConfigurationService.getKeyPairs only once', () => {
    agentConfigurationServiceMock.getKeyPairs.mockReturnValue(of(mockedKeyPairsResponse));

    service.getActiveWizardStepIndex().subscribe();

    expect(agentConfigurationServiceMock.getKeyPairs).toHaveBeenCalledTimes(1);
  });

});
