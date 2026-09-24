import {
  AfterViewInit,
  Component,
  inject,
  input,
  InputSignal, linkedSignal,
  output,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { EuiTooltipDirective } from '@eui/components/directives';
import { EUI_BLOCK_CONTENT } from '@eui/components/eui-block-content';
import {
  EUI_TABLE_V2,
  EuiTableV2Component,
  Sort,
} from '@eui/components/eui-table-v2';
import { EUI_BUTTON } from '@eui/components/eui-button';
import { EUI_ICON } from '@eui/components/eui-icon';
import {
  EUI_PAGINATOR,
  EuiPaginationEvent,
} from '@eui/components/eui-paginator';
import { ReadableBooleanPipe } from '@fe-simpl/core/pipes';
import { AgentConfigurationService } from '../../agent-configuration.service';
import { KeyPairPagedResponse } from '@simpl/api-client-authenticationprovider-tier1-v2';
import { FilterChipsComponent } from '@fe-simpl/filter-chips';
import { EuiChip, EuiChipComponent } from '@eui/components/eui-chip';

@Component({
  selector: 'app-credentials-table',
  imports: [
    CommonModule,
    TranslatePipe,
    ReadableBooleanPipe,
    FilterChipsComponent,
    EUI_BLOCK_CONTENT,
    EUI_TABLE_V2,
    EUI_BUTTON,
    EUI_ICON,
    EuiTooltipDirective,
    EUI_PAGINATOR,
  ],
  templateUrl: './credentials-table.component.html',
  styles: ``,
})
export class CredentialsTableComponent implements AfterViewInit {
  readonly _agentConfigurationService = inject(AgentConfigurationService);

  public readonly pagination: WritableSignal<EuiPaginationEvent> = signal({
    page: 0,
    pageSize: 10,
    nbPage: 5,
  });

  public readonly csrData: InputSignal<KeyPairPagedResponse> = input.required();
  view = input<'list' | 'wizard'>('list');

  exportCsr = output<string>();
  keypairDetail = output<string>();

  table = viewChild.required(EuiTableV2Component);

  defaultSorting = input<Sort[]>([]);

  sorting = linkedSignal<Sort[]>(() => {
    return this.defaultSorting();
  });

  ngAfterViewInit() {
    this.table().setSort(this.defaultSorting());
  }

  get isListView() {
    return this.view() === 'list';
  }

  onPageChange($event: EuiPaginationEvent) {
    this.pagination.set($event);
    this._agentConfigurationService.searchKeyPairs({
      pagination: this.pagination(),
      sort: this.sorting(),
    });
  }

  onSortChange($event: Sort[]) {
    this.sorting.set($event);
    this._agentConfigurationService.searchKeyPairs({ pagination: this.pagination(), sort: this.sorting() });
  }

  resetFilters() {
    this.resetPagination();
    this._agentConfigurationService.resetFilters();
    this._agentConfigurationService.updateChips();
    this._agentConfigurationService.searchKeyPairs({pagination: this.pagination(), sort: this.sorting()});
  }

  private resetPagination() {
    this.pagination.update( pagination => {
      return {
        page: 0,
        pageSize: pagination.pageSize,
        nbPage: 5,
      };
    });
  }

  removeChip(
    event:
      | EuiChip
      | EuiChipComponent
      | { chip: EuiChipComponent | EuiChip; event?: Event }
  ) {
    if (
      ['updateTimestampFrom', 'updateTimestampTo'].includes(
        String((event as EuiChip).id)
      )
    ) {
      const key = String((event as EuiChip).id) === 'updateTimestampFrom' ? 'startRange' : 'endRange';
      const newVal = this._agentConfigurationService.csrFiltersForm.get('dateRange').value;
      newVal[key] = null;
      this._agentConfigurationService.csrFiltersForm.get('dateRange').setValue(newVal);
    } else {
      this._agentConfigurationService.csrFiltersForm
        .get(String((event as EuiChip).id))
        ?.reset();
    }
    this._agentConfigurationService.csrFiltersForm.updateValueAndValidity();
    this._agentConfigurationService.updateChips();
    this.resetPagination();
    this._agentConfigurationService.searchKeyPairs({pagination: this.pagination(), sort: this.sorting()});
  }
}
