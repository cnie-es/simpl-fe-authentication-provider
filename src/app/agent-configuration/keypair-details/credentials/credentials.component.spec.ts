import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CredentialsComponent } from './credentials.component';
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
import { AgentConfigurationService } from '../../agent-configuration.service';
import { Observable, of, Subject } from 'rxjs';
import {
  ComponentRef,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { I18nDatePipe } from '@fe-simpl/core/pipes';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment-timezone';
import { provideNativeDateAdapter } from '@angular/material/core';
import { HttpEvent, HttpResponse } from '@angular/common/http';
import { CredentialByKeyPairResponse } from '@simpl/api-client-authenticationprovider-tier1-v2';
import {EuiDialogComponent, EuiDialogService} from '@eui/components/eui-dialog'; // added import
import { TranslocoTestingModule } from '@jsverse/transloco'; // transloco testing module
import en from '../../../../assets/i18n/en.json'; // import english translations
import { take } from 'rxjs/operators';
import {EUI_PAGE} from "@eui/components/eui-page";

describe('CredentialsComponent', () => {
  let component: CredentialsComponent;
  let fixture: ComponentFixture<CredentialsComponent>;
  let componentRef: ComponentRef<CredentialsComponent>;
  let mockEuiDialogComponent: Partial<EuiDialogComponent>;
  let mockDialogClose$: Subject<void>;
  let i18nServiceMock: jest.Mocked<I18nService>;
  let configMock: EuiAppConfig;

  const agentConfigurationServiceMock: jest.Mocked<
    Partial<AgentConfigurationService>
  > = {
    getCredentialsByKeypair: jest.fn().mockReturnValue(of({ page: 0 } as any)),
    getKeypairDetails: jest.fn().mockReturnValue(of({})),
    setActiveCredential: jest.fn(),
    installCredential: jest
      .fn()
      .mockReturnValue(of(new HttpResponse<number>({ body: 0 })) as Observable<HttpEvent<number>>),
  };

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
      imports: [
        CredentialsComponent,
        TranslateModule.forRoot(),
        TranslocoTestingModule.forRoot({
          translocoConfig: {
            availableLangs: ['en'],
            defaultLang: 'en',
          },
          langs: { en }
        })
      ],
      providers: [
        { provide: EuiAppShellService, useValue: { isBlockDocumentActive: jest.fn().mockReturnValue(true) } },
        { provide: LocaleService, useValue: i18nServiceMock },
        { provide: I18nService, useValue: { onStateChange: new Subject() } },
        { provide: I18nDatePipe, useValue: { transform: jest.fn() } },
        { provide: CONFIG_TOKEN, useValue: configMock },
        { provide: AgentConfigurationService, useValue: agentConfigurationServiceMock },
        { provide: EuiDialogComponent, useValue: mockEuiDialogComponent },
        { provide: EuiDialogService, useValue: {openDialog: jest.fn(), disableAcceptButton: jest.fn(), enableAcceptButton: jest.fn() } },
        provideNativeDateAdapter(),
        { provide: LOCALE_ID_MAPPER, useFactory: (): LocaleMapper => (l: string) => (l === 'it' ? 'it-IT' : 'en-GB') },
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).overrideComponent(CredentialsComponent, {
      remove: {
        imports: [
          ...EUI_PAGE
        ],
      }
    }).compileComponents();

    fixture = TestBed.createComponent(CredentialsComponent);
    componentRef = fixture.componentRef;
    componentRef.setInput('id', '12345');
    component = fixture.componentInstance;
    component.dialog = jest.fn(() => mockEuiDialogComponent as any) as any;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update pagination signal on onPageChange', () => {
    const mockPaginationEvent = { page: 1, pageSize: 10, nbPage: 5 };
    component.onPageChange(mockPaginationEvent);
    expect(component.pagination()).toEqual(mockPaginationEvent);
  });

  it('should call getCredentialsByKeypair with correct parameters', () => {
    const mockPaginationState = { page: 0, pageSize: 5, nbPage: 5 };
    const id = '12345';
    componentRef.setInput('id', id);

    component.pagination.set(mockPaginationState);

    expect(
      agentConfigurationServiceMock.getCredentialsByKeypair
    ).toHaveBeenCalledWith(id, {
      filters: null,
      pagination: mockPaginationState,
      sort: [],
    });
  });

  describe('resetCredentialsFilters', () => {
    it('should reset all filters to their default values', () => {
      component.ngOnInit();
      component.credentialsFiltersForm.setValue({
        status: 'VALID' as any,
        issuanceDateRange: { startRange: moment('2025-09-01'), endRange: moment('2025-09-02') } as any,
        expirationDateRange: { startRange: moment('2025-12-01'), endRange: moment('2025-12-31') } as any,
      });
      component.credentialsChips.set([
        { field: 'status', value: 'VALID' },
        { field: 'issuanceDateRange', value: 'From 01/09/2025 To 02/09/2025' },
      ] as any);
      component.resetCredentialsFilters();
      expect(component.credentialsFiltersForm.value).toEqual({
        status: null,
        issuanceDateRange: { startRange: null, endRange: null },
        expirationDateRange: { startRange: null, endRange: null },
      });
      expect(component.credentialsChips()).toEqual([]);
      expect(component.filtersData()).toBeNull();
    });

    it('should not throw an error when called on an already reset state', () => {
      // Act & Assert: Calling reset twice should not result in errors
      expect(() => {
        component.resetCredentialsFilters();
        component.resetCredentialsFilters();
      }).not.toThrow();
    });
  });

  describe('Credentials Sorting', () => {
    it('should set sortCriteria when a column is sorted', () => {
      component.onSortChange([
        {
          sort: 'status',
          order: 'asc',
        },
      ]);
      expect(component.sortCriteria()).toEqual([
        {
          sort: 'status',
          order: 'asc',
        },
      ]);
    });
    it('should call the api with updated sort criteria', (done) => {
      const id = '12345';
      componentRef.setInput('id', id);
      component.onSortChange([
        {
          sort: 'status',
          order: 'asc',
        },
      ]);
      component.onPageChange({
        page: 0,
        pageSize: 10,
        nbPage: 10,
      });
      component.sortCriteria.set([
        {
          sort: 'status',
          order: 'asc',
        },
      ]);
      fixture.detectChanges();
      component
        .credentials()
        .pipe(take(1))
        .subscribe(() => {
          expect(
            agentConfigurationServiceMock.getCredentialsByKeypair
          ).toHaveBeenCalledWith(id, {
            pagination: component.pagination(),
            sort: component.sortCriteria(),
            filters: null,
          });
          done();
        });
    });
  });

  describe('installCredential flow', () => {
    it('should set selected credential and open dialog disabling accept', () => {
      const row: CredentialByKeyPairResponse = { content: 'abc' } as any;
      const openSpy = jest.spyOn(component.dialog, 'openDialog');
      const disableSpy = jest.spyOn(component.dialog, 'disableAcceptButton').mockReturnValue();
      component.installCredential(row);
      expect(component.credentialSelected).toEqual(row);
      expect(openSpy).toHaveBeenCalled();
      expect(disableSpy).toHaveBeenCalled();
    });
    it('onChangeReason should enable/disable accept button accordingly', () => {
      const enableSpy = jest.spyOn(component.dialog, 'enableAcceptButton').mockReturnValue();
      const disableSpy = jest.spyOn(component.dialog, 'disableAcceptButton').mockReturnValue();
      component.onChangeReason('reason');
      expect(enableSpy).toHaveBeenCalled();
      component.onChangeReason('');
      expect(disableSpy).toHaveBeenCalled();
    });
    it('onAccept should call installCredential then setActiveCredential', () => {
      component.credentialSelected = { content: 'credential-content' } as any;
      component.reason = 'my reason';
      const installSpy = jest
        .spyOn(agentConfigurationServiceMock, 'installCredential')
        .mockReturnValue(of(new HttpResponse<number>({ body: 1 })) as Observable<HttpEvent<number>>);
      const activeSpy = jest.spyOn(agentConfigurationServiceMock, 'setActiveCredential');
      component.onAccept();
      expect(installSpy).toHaveBeenCalledWith('credential-content', 'my reason');
      expect(activeSpy).toHaveBeenCalled();
    });
    it('onClose should clear credentialSelected and reason', () => {
      component.credentialSelected = { content: 'x' } as any;
      component.reason = 'r';
      component.onClose();
      expect(component.credentialSelected).toBeNull();
      expect(component.reason).toBeNull();
    });
  });

  describe('addFilter', () => {
    it('should create chips for date ranges and string filters', () => {
      component.ngOnInit();
      component.credentialsFiltersForm.setValue({
        status: 'VALID' as any,
        issuanceDateRange: { startRange: moment('2025-09-01'), endRange: moment('2025-09-02') } as any,
        expirationDateRange: { startRange: moment('2025-12-01'), endRange: moment('2025-12-31') } as any,
      });
      const addChipSpy = jest.spyOn<any, any>(component, 'addCredentialChip');
      component.addFilter();
      const issuanceCall = addChipSpy.mock.calls.find(c => c[0] === 'issuanceDateRange');
      const expirationCall = addChipSpy.mock.calls.find(c => c[0] === 'expirationDateRange');
      const statusCall = addChipSpy.mock.calls.find(c => c[0] === 'status');
      expect(issuanceCall).toBeDefined();
      expect(issuanceCall![1]).toContain('01/09/2025');
      expect(expirationCall).toBeDefined();
      expect(expirationCall![1]).toContain('01/12/2025');
      expect(statusCall).toBeDefined();
      expect(statusCall![1]).toBe('filters.status.VALID');
    });
    it('should remove chips when values are null', () => {
      component.ngOnInit();
      const removeChipSpy = jest.spyOn<any, any>(component, 'removeCredentialChip');
      component.credentialsFiltersForm.setValue({
        status: null as any,
        issuanceDateRange: { startRange: null, endRange: null } as any,
        expirationDateRange: { startRange: null, endRange: null } as any,
      });
      component.addFilter();

      expect(removeChipSpy).toHaveBeenCalledWith('status');
      expect(removeChipSpy).toHaveBeenCalledWith('issuanceDateRange');
      expect(removeChipSpy).toHaveBeenCalledWith('expirationDateRange');
    });
  });
});
