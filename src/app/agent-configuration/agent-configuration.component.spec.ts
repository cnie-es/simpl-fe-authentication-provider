import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AgentConfigurationComponent } from './agent-configuration.component';
import { TranslateModule } from '@ngx-translate/core';
import { AgentConfigurationService } from './agent-configuration.service';
import { Observable, of, throwError } from 'rxjs';
import { CONFIG_TOKEN, EuiAppConfig, EuiAppShellService, I18nService, I18nState, LocaleService } from '@eui/core';
import { EUI_PAGE } from '@eui/components/eui-page';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CredentialsTableComponent } from './components/credentials-table/credentials-table.component';
import { FiltersComponent } from './components/filters/filters.component';
import { HttpErrorResponse } from '@angular/common/http';
import { AutomaticRenewalsService } from '@simpl/api-client-authenticationprovider-tier1-v2';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {provideAnimations} from "@angular/platform-browser/animations";

describe('AgentConfigurationComponent', () => {
  let component: AgentConfigurationComponent;
  let fixture: ComponentFixture<AgentConfigurationComponent>;

  const agentConfigurationServiceMock: jest.Mocked<
    Partial<AgentConfigurationService>
  > = {
    getActiveKeypair: () => of(true),
    getKeyPairs: jest.fn().mockReturnValue(of({})),
    getKeypairsAlgorithm: jest.fn().mockReturnValue(of({})),
    searchKeyPairs: jest.fn().mockReturnValue(of({})),
  } as any;

  const automaticRenewalServiceMock = {
    getAutomaticRenewal: jest.fn().mockReturnValue(of({ set: true})),
    updateAutomaticRenewal: jest.fn().mockReturnValue(of({ set: false})),
  }

  let i18nServiceMock: jest.Mocked<I18nService>;
  let configMock: EuiAppConfig;

  configMock = {
    global: {},
    modules: { core: { base: 'localhost:3000', userDetails: 'dummy' } },
  };

  beforeEach(async () => {
    type GetStateReturnType<T> = T extends keyof I18nState
      ? Observable<I18nState[T]>
      : Observable<I18nState>;
    configMock = {
      global: {},
      modules: { core: { base: 'localhost:3000', userDetails: 'dummy' } },
    };
    i18nServiceMock = {
      init: jest.fn(),
      getState: jest.fn(
        <K extends keyof I18nState>(key?: K): GetStateReturnType<K> => {
          if (typeof key === 'string') {
            return of({ activeLang: 'en' }[key]) as GetStateReturnType<K>;
          }
          return of({ activeLang: 'en' }) as GetStateReturnType<K>;
        }
      ),
    } as unknown as jest.Mocked<I18nService>;

    configMock = {
      global: {},
      modules: { core: { base: 'localhost:3000', userDetails: 'dummy' } },
    };

    await TestBed.configureTestingModule({
      imports: [
        AgentConfigurationComponent,
        TranslateModule.forRoot(),
        RouterTestingModule,
      ],
      providers: [
        provideAnimationsAsync(),
        provideAnimations(),
        {
          provide: AgentConfigurationService,
          useValue: agentConfigurationServiceMock,
        },
        {
          provide: AutomaticRenewalsService,
          useValue: automaticRenewalServiceMock,
        },
        {
          provide: EuiAppShellService,
          useValue: {
            isBlockDocumentActive: jest.fn().mockReturnValue(true),
          },
        },
        { provide: LocaleService, useValue: i18nServiceMock },
        { provide: CONFIG_TOKEN, useValue: configMock },
      ],
    })
      .overrideComponent(AgentConfigurationComponent, {
        remove: {
          imports: [...EUI_PAGE, CredentialsTableComponent, FiltersComponent],
        },
        add: {
          schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AgentConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isDialogUploadOpen to true when updateAndInstallCredential is called', () => {
    component.updateAndInstallCredential();
    expect(component.isDialogUploadOpen()).toBe(true);
  });

  it('should call updateAutomaticRenewal with { set: true } and enable renewal', () => {
    const updateSpy = jest.spyOn(automaticRenewalServiceMock, 'updateAutomaticRenewal');
    component.toggleAutomaticRenewal(true);
    expect(updateSpy).toHaveBeenCalledWith({ set: true });
  });

  it('should call updateAutomaticRenewal with { set: false } and disable renewal', () => {
    const updateSpy = jest.spyOn(automaticRenewalServiceMock, 'updateAutomaticRenewal');
    component.toggleAutomaticRenewal(false);
    expect(updateSpy).toHaveBeenCalledWith({ set: false });
  });

  it('should show an error growl message and revert form value when called with false and service fails', () => {
    const growlSpy = jest.spyOn(component['growlService'], 'growl');
    const translateSpy = jest.spyOn(component['translateService'], 'instant');

    jest.spyOn(automaticRenewalServiceMock, 'updateAutomaticRenewal').mockReturnValue(
      throwError(() => new Error('Service failed'))
    );

    component.automaticRenewalForm.patchValue({ set: true });
    component.toggleAutomaticRenewal(false);

    expect(translateSpy).toHaveBeenCalled();
    expect(growlSpy).toHaveBeenCalled();
    expect(component.automaticRenewalForm.get('set')?.value).toBe(true);
  });

  it('should navigate to the keypair detail page with the correct ID when onNavigateKeypairDetail is called', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate');
    const keypairId = '12345';

    component.onNavigateKeypairDetail(keypairId);

    expect(navigateSpy).toHaveBeenCalledWith([
      '/agent-configuration/keypair',
      keypairId,
    ]);
  });

  it('should set keypairId to null when onCsrDialogClose is called', () => {
    component.keypairId.set('some-id');
    component.onCsrDialogClose();
    expect(component.keypairId()).toBeNull();
  });

  it('should set isCsrDialogOpen to false when onCsrDialogClose is called', () => {
    component.keypairId.set('some-id');
    component.onCsrDialogClose();
    expect(component.isCsrDialogOpen()).toBe(false);
  });

  it('should set isDialogUploadOpen to false when onDialogClose is called with { role: "confirm" }', () => {
    component.onDialogClose({ role: 'confirm' });
    expect(component.isDialogUploadOpen()).toBe(false);
  });

  it('should set isDialogUploadOpen to false when onDialogClose is called with { role: "cancel" }', () => {
    component.onDialogClose({ role: 'confirm' });
    expect(component.isDialogUploadOpen()).toBe(false);
  });

  it('should set isDialogGenerateOpen to true when generateNewKeypair is called', () => {
    component.generateNewKeypair();
    expect(component.isDialogGenerateOpen()).toBe(true);
  });

  it('should set isDialogImportOpen to true when importKeypair is called', () => {
    component.importKeypair();
    expect(component.isDialogImportOpen()).toBe(true);
  });

  it('should return the observable from getAlgorithm', () => {
    component.getAlgorithm().subscribe((result) => {
      expect(result).toBeDefined();
    });
  });

  it('should close the dialog if getAlgorithm throws an error', () => {
    jest
      .spyOn(agentConfigurationServiceMock, 'getKeypairsAlgorithm')
      .mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 500 }))
      );
    component.getAlgorithm().subscribe({
      next: (result) => {
        expect(result).not.toBeDefined();
      },
      error: (error) => {
        expect(component.isDialogImportOpen()).toBe(false);
        expect(error).toBeDefined();
      },
    });
  });

  it('should call searchKeyPairs and set dialog flags to false when onDialogKeypairClose is called', () => {
    jest.spyOn(agentConfigurationServiceMock, 'searchKeyPairs');
    component.onDialogKeypairClose({ role: 'confirm' });
    expect(component.isDialogGenerateOpen()).toBe(false);
    expect(component.isDialogImportOpen()).toBe(false);
    expect(agentConfigurationServiceMock.searchKeyPairs).toHaveBeenCalled();
  });

  it('should set isDialogUploadOpen to false when onDialogClose is called with { role: "confirm" }', () => {
    component.onDialogClose({ role: 'confirm' });
    expect(component.isDialogUploadOpen()).toBe(false);
  });
});
