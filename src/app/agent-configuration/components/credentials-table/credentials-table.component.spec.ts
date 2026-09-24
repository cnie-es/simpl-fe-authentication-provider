import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CredentialsTableComponent } from './credentials-table.component';
import { EuiAppShellService } from '@eui/core';
import { TranslateModule } from '@ngx-translate/core';
import { AgentConfigurationComponent } from '../../agent-configuration.component';
import { EuiPageModule } from '@eui/components/eui-page';
import {
  ComponentRef,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  signal,
} from '@angular/core';
import { mockedKeyPairsResponse } from '../../mocks/data';
import { AgentConfigurationService } from '../../agent-configuration.service';
import { of } from 'rxjs';
import { Sort } from '@eui/components/eui-table-v2';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { EuiChip } from '@eui/components/eui-chip';
import en from "../../../../assets/i18n/en.json";
import {FormControl, FormGroup} from "@angular/forms";
import {EuiDateRangeSelectorDates, euiStartEndDateValidator} from "@eui/components/eui-date-range-selector";

describe('CredentialsTableComponent', () => {
  let component: CredentialsTableComponent;
  let fixture: ComponentFixture<CredentialsTableComponent>;
  let componentRef: ComponentRef<CredentialsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CredentialsTableComponent,
        TranslateModule.forRoot(),
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
        ),
      ],
      providers: [
        {
          provide: AgentConfigurationService,
          useValue: {
            searchKeyPairs: jest
              .fn()
              .mockReturnValue(of(mockedKeyPairsResponse)),
            resetFilters: jest.fn(),
            csrFiltersChips: signal([]),
            updateChips: jest.fn(),
            csrFiltersForm: new FormGroup({
              active: new FormControl(),
              name: new FormControl(),
              dateRange: new FormControl<EuiDateRangeSelectorDates>(
                {
                  value: {
                    startRange: null,
                    endRange: null,
                  },
                  disabled: false,
                },
              ),
            })
          },
        },
        { provide: EuiAppShellService, useValue: {} },
      ],
    })
      .overrideComponent(AgentConfigurationComponent, {
        remove: {
          imports: [EuiPageModule],
        },
        add: {
          schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CredentialsTableComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('csrData', mockedKeyPairsResponse);
    fixture.detectChanges();
  });

  it('should reset the correct dateRange control value when updateTimestampFrom or updateTimestampTo chip is removed', () => {
    const agentConfigurationService = TestBed.inject(AgentConfigurationService);
    console.log(agentConfigurationService.csrFiltersForm)

    const spyUpdateChips = jest.spyOn(agentConfigurationService, 'updateChips');
    const spySearchKeyPairs = jest.spyOn(
      agentConfigurationService,
      'searchKeyPairs'
    );

    component.removeChip({
      id: 'updateTimestampFrom',
    } as EuiChip);

    expect(spyUpdateChips).toHaveBeenCalled();
    expect(spySearchKeyPairs).toHaveBeenCalled();
  });

  it('should reset the form control of the removed chip and call services', () => {
    const agentConfigurationService = TestBed.inject(AgentConfigurationService);
    const mockReset = jest.fn();

    jest
      .spyOn(agentConfigurationService.csrFiltersForm, 'get')
      .mockImplementation((controlName) => {
        if (controlName === 'testId') {
          return { reset: mockReset } as any;
        }
        return { reset: jest.fn() } as any;
      });

    const spyUpdateValueAndValidity = jest.spyOn(
      agentConfigurationService.csrFiltersForm,
      'updateValueAndValidity'
    );
    const spyUpdateChips = jest.spyOn(agentConfigurationService, 'updateChips');
    const spySearchKeyPairs = jest.spyOn(
      agentConfigurationService,
      'searchKeyPairs'
    );

    component.removeChip({ id: 'testId' } as EuiChip);

    expect(mockReset).toHaveBeenCalled();
    expect(spyUpdateValueAndValidity).toHaveBeenCalled();
    expect(spyUpdateChips).toHaveBeenCalled();
    expect(spySearchKeyPairs).toHaveBeenCalled();
  });

  it('should handle cases with invalid chip id without throwing errors', () => {
    const agentConfigurationService = TestBed.inject(AgentConfigurationService);
    const spyUpdateValueAndValidity = jest.spyOn(
      agentConfigurationService.csrFiltersForm,
      'updateValueAndValidity'
    );
    const spyUpdateChips = jest.spyOn(agentConfigurationService, 'updateChips');
    const spySearchKeyPairs = jest.spyOn(
      agentConfigurationService,
      'searchKeyPairs'
    );

    component.removeChip({ id: 'invalidId' } as EuiChip);

    expect(spyUpdateValueAndValidity).toHaveBeenCalled();
    expect(spyUpdateChips).toHaveBeenCalled();
    expect(spySearchKeyPairs).toHaveBeenCalled();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update pagination and call searchKeyPairs on page change', () => {
    const agentConfigurationService = TestBed.inject(AgentConfigurationService);
    const paginationEvent = { page: 2, pageSize: 10, nbPage: 5 };
    jest.spyOn(agentConfigurationService, 'searchKeyPairs');

    component.onPageChange(paginationEvent);
    expect(component.pagination()).toEqual(paginationEvent);
    expect(agentConfigurationService.searchKeyPairs).toHaveBeenCalledWith({
      pagination: paginationEvent,
      sort: []
    });
  });

  it('should reset filters and call searchKeyPairs', () => {
    const agentConfigurationService = TestBed.inject(AgentConfigurationService);
    jest.spyOn(agentConfigurationService, 'resetFilters');
    jest.spyOn(agentConfigurationService, 'searchKeyPairs');

    component.resetFilters();
    expect(agentConfigurationService.resetFilters).toHaveBeenCalled();
    expect(agentConfigurationService.searchKeyPairs).toHaveBeenCalled();
  });

  it('should call searchKeyPairs with correct sort parameter on sort change', () => {
    const agentConfigurationService = TestBed.inject(AgentConfigurationService);
    const sortEvent = [{ sort: 'name', order: 'asc' }];
    jest.spyOn(agentConfigurationService, 'searchKeyPairs');

    component.onSortChange(sortEvent as Array<Sort>);
    expect(agentConfigurationService.searchKeyPairs).toHaveBeenCalledWith({
      sort: sortEvent,
      pagination: component.pagination(),
    });
  });
});
