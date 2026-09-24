import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EUI_BUTTON } from '@eui/components/eui-button';
import { EUI_LABEL } from '@eui/components/eui-label';
import { ReactiveFormsModule } from '@angular/forms';
import { EUI_DATE_RANGE_SELECTOR } from '@eui/components/eui-date-range-selector';
import { EUI_BUTTON_GROUP } from '@eui/components/eui-button-group';
import { EUI_INPUT_GROUP } from '@eui/components/eui-input-group';
import { EUI_INPUT_TEXT } from '@eui/components/eui-input-text';
import { EUI_SELECT } from '@eui/components/eui-select';
import { TranslatePipe } from '@ngx-translate/core';
import { AgentConfigurationService } from '../../agent-configuration.service';
import { EuiMaxLengthDirective } from '@eui/components/directives';

@Component({
  selector: 'app-filters',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    EuiMaxLengthDirective,
    ...EUI_INPUT_GROUP,
    ...EUI_LABEL,
    ...EUI_INPUT_TEXT,
    ...EUI_SELECT,
    ...EUI_DATE_RANGE_SELECTOR,
    ...EUI_BUTTON_GROUP,
    ...EUI_BUTTON,
  ],
  templateUrl: './filters.component.html',
})
export class FiltersComponent {
  private readonly _agentConfigurationService = inject(
    AgentConfigurationService
  );

  filtersForm = this._agentConfigurationService.csrFiltersForm;

  addFilter() {
    this._agentConfigurationService.updateChips();
    this._agentConfigurationService.searchKeyPairs();
  }

  resetParticipantFilters() {
    this._agentConfigurationService.resetFilters();
    this._agentConfigurationService.searchKeyPairs();
  }
}
