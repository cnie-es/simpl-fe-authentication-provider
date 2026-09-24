import {
  Component,
  inject,
  input,
  linkedSignal,
  OnInit,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EUI_INPUT_GROUP } from '@eui/components/eui-input-group';
import { EUI_LABEL } from '@eui/components/eui-label';
import { EUI_PAGE } from '@eui/components/eui-page';
import {
  EUI_PAGINATOR,
  EuiPaginationEvent,
} from '@eui/components/eui-paginator';
import {EuiMaxLengthDirective, EuiTooltipDirective} from '@eui/components/directives';
import { EUI_TABLE_V2, Sort } from '@eui/components/eui-table-v2';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AgentConfigurationService } from '../../agent-configuration.service';
import { I18nDatePipe } from '@fe-simpl/core/pipes';
import { shareReplay, tap} from 'rxjs';
import { EUI_BLOCK_CONTENT } from '@eui/components/eui-block-content';
import { EUI_BUTTON_GROUP } from '@eui/components/eui-button-group';
import { EUI_BUTTON } from '@eui/components/eui-button';
import {
  EUI_DATE_RANGE_SELECTOR,
  EuiDateRangeSelectorDates,
} from '@eui/components/eui-date-range-selector';
import { EUI_SELECT } from '@eui/components/eui-select';
import { startEndDateRangeValidator } from '@fe-simpl/utils';
import {
  CredentialByKeyPairResponse,
  CredentialsByKeyPairPagedRequest,
  CredentialsByKeyPairPagedResponse,
  CredentialStatus,
} from '@simpl/api-client-authenticationprovider-tier1-v2';
import { EUI_CHIP, EuiChip, EuiChipComponent } from '@eui/components/eui-chip';
import { FilterChipsComponent } from '@fe-simpl/filter-chips';
import {EUI_DIALOG, EuiDialogComponent} from '@eui/components/eui-dialog';
import { EUI_ICON_BUTTON } from '@eui/components/eui-icon-button';
import {EuiTextareaComponent} from "@eui/components/eui-textarea";

@Component({
  selector: 'app-credentials',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    I18nDatePipe,
    FilterChipsComponent,
    ...EUI_PAGE,
    ...EUI_INPUT_GROUP,
    ...EUI_LABEL,
    ...EUI_SELECT,
    ...EUI_DATE_RANGE_SELECTOR,
    ...EUI_BUTTON_GROUP,
    ...EUI_BUTTON,
    ...EUI_BLOCK_CONTENT,
    ...EUI_TABLE_V2,
    ...EUI_CHIP,
    ...EUI_ICON_BUTTON,
    EuiTooltipDirective,
    ...EUI_PAGINATOR,
    ...EUI_DIALOG,
    EuiMaxLengthDirective,
    EuiTextareaComponent,
    FormsModule,
  ],
  providers: [DatePipe],
  templateUrl: './credentials.component.html',
  styles: ``,
})
export class CredentialsComponent implements OnInit {
  id = input.required<string>();
  agentConfigurationService = inject(AgentConfigurationService);
  translateService = inject(TranslateService);
  datePipe = inject(DatePipe);
  public readonly pagination: WritableSignal<EuiPaginationEvent> = signal({
    page: 0,
    pageSize: 5,
    nbPage: 5,
  });
  sortCriteria: WritableSignal<Sort[]> = signal([]);

  credentialsFiltersForm: FormGroup<{
    status: FormControl<CredentialStatus>;
    issuanceDateRange: FormControl<EuiDateRangeSelectorDates | null>;
    expirationDateRange: FormControl<EuiDateRangeSelectorDates | null>;
  }>;

  credentials = linkedSignal(() => {
    console.log(this.pagination())
    return this.agentConfigurationService
      .getCredentialsByKeypair(this.id(), {
        pagination: this.pagination(),
        sort: this.sortCriteria(),
        filters: this.filtersData(),
      })
      .pipe(
        shareReplay(),
        tap((data) => {
          this.tableData.set(data);
        })
      );
  });

  tableData = signal<CredentialsByKeyPairPagedResponse | null>(null);

  credentialsChips = signal<
    Array<{
      field: Partial<keyof CredentialsByKeyPairPagedRequest>;
      value: string;
    }>
  >([]);

  filtersData = signal<Partial<{
    status: CredentialStatus;
    issuanceDateRange: EuiDateRangeSelectorDates | null;
    expirationDateRange: EuiDateRangeSelectorDates | null;
  }> | null>(null);

  @ViewChild('dialog') dialog: EuiDialogComponent;
  credentialSelected: CredentialByKeyPairResponse | null = null;
  reason: string = '';

  ngOnInit() {
    this.credentialsFiltersForm = new FormGroup({
      status: new FormControl(),
      issuanceDateRange: new FormControl<EuiDateRangeSelectorDates>(
        {
          value: {
            startRange: null,
            endRange: null,
          },
          disabled: false,
        },
        [startEndDateRangeValidator]
      ),
      expirationDateRange: new FormControl<EuiDateRangeSelectorDates>(
        {
          value: {
            startRange: null,
            endRange: null,
          },
          disabled: false,
        },
        [startEndDateRangeValidator]
      ),
    });
  }

  onSortChange($event: Sort[]) {
    this.sortCriteria.set($event);
  }

  onPageChange($event: EuiPaginationEvent) {
    this.pagination.set($event);
  }

  addFilter() {
    const filters = this.credentialsFiltersForm.value;
    this.filtersData.set(filters);
    this.pagination.update( pagination => {
      return {
        page: 0,
        pageSize: pagination.pageSize,
        nbPage: 5,
      };
    });
    Object.entries(filters).forEach(
      ([key, value]: [
        string,
        CredentialStatus | EuiDateRangeSelectorDates | null
      ]) => {
        if (!value) {
          this.removeCredentialChip(key);
          return;
        }

        if (typeof value !== 'string' && (value.startRange || value.endRange)) {
          const translatedFrom = this.translateService.instant('filters.from');
          const translatedTo = this.translateService.instant('filters.to');
          let chipText = ``;

          if (value.startRange) {
            chipText += `${translatedFrom} ${this.datePipe.transform(
              value.startRange,
              'dd/MM/yyyy'
            )}`;
          }

          if (value.endRange) {
            chipText += ` ${translatedTo} ${this.datePipe.transform(
              value.endRange,
              'dd/MM/yyyy'
            )}`;
          }
          this.addCredentialChip(key, chipText);
          return;
        }

        if (typeof value === 'string') {
          const translatedValue = key === 'status' ? this.translateService.instant(`filters.status.${value}`) : value;
          this.addCredentialChip(key, `${translatedValue}`);
          return;
        }

        this.removeCredentialChip(key);
      }
    );
  }

  onChipRemove(
    $event:
      | EuiChip
      | EuiChipComponent
      | { chip: EuiChipComponent | EuiChip; event?: Event }
  ) {
    this.removeCredentialChip(String(($event as EuiChip).id));
  }

  private removeCredentialChip(key: string) {
    this.credentialsChips.update((actualChips) => {
      return actualChips.filter((chip) => chip.field !== key);
    });
    this.credentialsFiltersForm.get(key).reset(null);
    this.filtersData.set(this.credentialsFiltersForm.value);
    this.pagination.update( pagination => {
      return {
        page: 0,
        pageSize: pagination.pageSize,
        nbPage: 5,
      };
    });
  }

  private addCredentialChip(key: string, chipText: string) {
    const found = this.credentialsChips().find((chip) => chip.field === key);
    if (found) {
      found.value = chipText;
    } else {
      const chip = {
        field: key as keyof CredentialsByKeyPairPagedRequest,
        value: chipText,
      };
      this.credentialsChips.update((actualChips) => {
        return [...actualChips, chip];
      });
    }
  }

  resetCredentialsFilters() {
    this.credentialsFiltersForm.reset({
      status: undefined,
      issuanceDateRange: {
        startRange: null,
        endRange: null,
      },
      expirationDateRange: {
        startRange: null,
        endRange: null,
      },
    });
    this.credentialsChips.set([]);
    this.filtersData.set(null);
  }

  installCredential(row: CredentialByKeyPairResponse) {
    this.credentialSelected = row;
    this.dialog.openDialog();
    this.dialog.disableAcceptButton();
  }

  onAccept() {
    this.agentConfigurationService
      .installCredential(this.credentialSelected.content, this.reason)
      .pipe(
        tap(() => {
          this.agentConfigurationService.setActiveCredential();
        })
      )
      .subscribe();
  }

  onClose() {
    this.credentialSelected = null;
    this.reason = null;
  }

  onChangeReason(event: string) {
    if (event.length > 0) {
      this.dialog.enableAcceptButton();
    } else
      this.dialog.disableAcceptButton();
  }
}
