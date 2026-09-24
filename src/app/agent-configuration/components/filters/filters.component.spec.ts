import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiltersComponent } from './filters.component';
import { TranslateModule } from '@ngx-translate/core';
import { AgentConfigurationService } from '../../agent-configuration.service';
import { Observable, of } from 'rxjs';
import { mockedKeyPairsResponse } from '../../mocks/data';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { EuiDateRangeSelectorModule } from '@eui/components/eui-date-range-selector';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { CONFIG_TOKEN, EuiAppConfig, I18nService, I18nState, LocaleService } from '@eui/core';
import en from "../../../../assets/i18n/en.json";

describe('FiltersComponent', () => {
  let component: FiltersComponent;
  let fixture: ComponentFixture<FiltersComponent>;
  let i18nServiceMock: jest.Mocked<I18nService>;
  let configMock: EuiAppConfig;

  const mockForm = new FormGroup({
    active: new FormControl(''),
    name: new FormControl(''),
    dateRange: new FormControl({
      value: {
        startRange: null,
        endRange: null,
      },
      disabled: false,
    }),
  });

  beforeEach(async () => {
    type GetStateReturnType<T> = T extends keyof I18nState ? Observable<I18nState[T]> : Observable<I18nState>;
    configMock = {global: {}, modules: {core: {base: 'localhost:3000', userDetails: 'dummy'}}};
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

    configMock = { global: {}, modules: { core: { base: 'localhost:3000', userDetails: 'dummy' } } };

    await TestBed.configureTestingModule({
      imports: [
        FiltersComponent,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        NoopAnimationsModule,
        EuiDateRangeSelectorModule,
        TranslocoTestingModule.forRoot(
          {
            translocoConfig: {
              availableLangs: ["en"],
              defaultLang: "en",
            },
            langs: {
              en: en
            }
          }
        )
      ],
      providers: [
        {
          provide: AgentConfigurationService,
          useValue: {
            searchKeyPairs: jest.fn().mockReturnValue(of(mockedKeyPairsResponse)),
            csrFiltersForm: mockForm,
            csrFiltersChips: signal([]),
            updateChips: jest.fn(),
            resetFilters: jest.fn()
          }
        },
        {provide: LocaleService, useValue: i18nServiceMock},
        {provide: CONFIG_TOKEN, useValue: configMock},
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call updateChips when addFilter is called', () => {
    const updateChipsSpy = jest.spyOn(component['_agentConfigurationService'], 'updateChips');
    component.addFilter();
    expect(updateChipsSpy).toHaveBeenCalledTimes(1);
  });

  it('should call resetFilters when resetParticipantFilters is called', () => {
    const resetFiltersSpy = jest.spyOn(component['_agentConfigurationService'], 'resetFilters');
    component.resetParticipantFilters();
    expect(resetFiltersSpy).toHaveBeenCalledTimes(1);
  });

  it('should refresh data on resetParticipantsFilter', () => {
    const updateChipsSpy = jest.spyOn(component['_agentConfigurationService'], 'updateChips');
    const searchKeyPairsSpy = jest.spyOn(component['_agentConfigurationService'], 'searchKeyPairs');
    component.resetParticipantFilters();
    expect(updateChipsSpy).not.toHaveBeenCalled();
    expect(searchKeyPairsSpy).toHaveBeenCalled();
  });

  it('should call searchKeyPairs when addFilter is called', () => {
    const searchKeyPairsSpy = jest.spyOn(component['_agentConfigurationService'], 'searchKeyPairs');
    component.addFilter();
    expect(searchKeyPairsSpy).toHaveBeenCalledTimes(1);
  });
});
