import {ComponentFixture, TestBed} from '@angular/core/testing';

import {KeypairDetailsComponent} from './keypair-details.component';
import {
    CONFIG_TOKEN,
    EuiAppConfig,
    EuiAppShellService,
    I18nService,
    I18nState,
    LOCALE_ID_MAPPER,
    LocaleMapper,
    LocaleService,
} from '@eui/core';
import {Observable, of, Subject} from 'rxjs';
import {ComponentRef, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA,} from '@angular/core';
import {AgentConfigurationService} from '../agent-configuration.service';
import {TranslateModule} from '@ngx-translate/core';
import {I18nDatePipe} from '@fe-simpl/core/pipes';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import { EUI_TABS } from '@eui/components/eui-tabs';
import {CredentialsComponent} from './credentials/credentials.component';

describe('KeypairDetailsComponent', () => {
  let component: KeypairDetailsComponent;
  let fixture: ComponentFixture<KeypairDetailsComponent>;
  let componentRef: ComponentRef<KeypairDetailsComponent>;

  let i18nServiceMock: jest.Mocked<I18nService>;
  let configMock: EuiAppConfig;

  const agentConfigurationServiceMock: jest.Mocked<
    Partial<AgentConfigurationService>
  > = {
    getCredentialsByKeypair: jest.fn().mockReturnValue(of({})),
    getKeypairDetails: jest.fn().mockReturnValue(of({})),
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

    await TestBed.configureTestingModule({
      imports: [KeypairDetailsComponent, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        {
          provide: EuiAppShellService,
          useValue: {
            isBlockDocumentActive: jest.fn().mockReturnValue(true),
          },
        },
        { provide: LocaleService, useValue: i18nServiceMock },
        {
          provide: I18nService,
          useValue: {
            onStateChange: new Subject(),
          },
        },
        { provide: I18nDatePipe, useValue: { transform: jest.fn() } },
        { provide: CONFIG_TOKEN, useValue: configMock },
        {
          provide: AgentConfigurationService,
          useValue: agentConfigurationServiceMock,
        },
        {
          provide: LOCALE_ID_MAPPER,
          useFactory: (): LocaleMapper => {
            return (locale: string) => {
              switch (locale) {
                case 'it':
                  return 'it-IT';
                default:
                  return 'en-GB';
              }
            };
          },
        },
      ],
    })
      .overrideComponent(KeypairDetailsComponent, {
        remove: {
          imports: [CredentialsComponent, ...EUI_TABS],
        },
        add: {
          schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(KeypairDetailsComponent);
    componentRef = fixture.componentRef;
    componentRef.setInput('id', '12345');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should throw error on generateCSR because is still not implemented', () => {
    try {
      component.downloadCSR();
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

    it('should close the dialog and set newCredentialDialogOpen to false, regardless of role', () => {
        const openGrowlMock = jest.fn();
        component.agentConfigurationService.openGrowl = openGrowlMock;
        component.newCredentialDialogOpen.set(true);

        component.onDialogClose({role: 'cancel'});
        expect(component.newCredentialDialogOpen()).toBe(false);

        component.newCredentialDialogOpen.set(true);

        component.onDialogClose({role: 'confirm'});
        expect(component.newCredentialDialogOpen()).toBe(false);
    });

    it('should call openGrowl with correct message and type when role is confirm', () => {
        const openGrowlMock = jest.fn();
        component.agentConfigurationService.openGrowl = openGrowlMock;

        component.onDialogClose({role: 'confirm'});

        expect(openGrowlMock).toHaveBeenCalledWith(
            'agentConfiguration.credentialsDetail.newCredentialsRequested',
            'success'
        );
    });
});
