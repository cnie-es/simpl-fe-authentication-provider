import { Component, computed, inject, input, signal } from '@angular/core';
import { AgentConfigurationService } from '../agent-configuration.service';
import { EUI_PAGE } from '@eui/components/eui-page';
import { TranslatePipe } from '@ngx-translate/core';
import { EUI_BUTTON } from '@eui/components/eui-button';
import { EUI_LABEL } from '@eui/components/eui-label';
import { EUI_ICON } from '@eui/components/eui-icon';
import { AsyncPipe } from '@angular/common';
import { EUI_TABLE_V2 } from '@eui/components/eui-table-v2';
import { map } from 'rxjs/operators';
import { I18nDatePipe } from '@fe-simpl/core/pipes';
import { shareReplay } from 'rxjs';
import { EUI_BLOCK_CONTENT } from '@eui/components/eui-block-content';
import { EUI_TABS } from '@eui/components/eui-tabs';
import { CredentialsComponent } from './credentials/credentials.component';
import { CsrExportComponent } from '../dialogs/csr-export/csr-export.component';
import {EuiTooltipDirective} from "@eui/components/directives";

@Component({
  selector: 'app-keypair-details',
  imports: [
    TranslatePipe,
    AsyncPipe,
    I18nDatePipe,
    CredentialsComponent,
    CredentialsComponent,
    CsrExportComponent,
    ...EUI_PAGE,
    ...EUI_ICON,
    ...EUI_BUTTON,
    ...EUI_LABEL,
    ...EUI_BLOCK_CONTENT,
    ...EUI_TABLE_V2,
    ...EUI_TABS,
    EuiTooltipDirective,
  ],
  templateUrl: './keypair-details.component.html',
  styles: ``,
})
export class KeypairDetailsComponent {
  id = input.required<string>();
  agentConfigurationService = inject(AgentConfigurationService);
  keypairDetails = computed(() => {
    return this.agentConfigurationService.getKeypairDetails(this.id()).pipe(
      map((details) => [details]),
      shareReplay()
    );
  });
  newCredentialDialogOpen = signal<boolean>(false);

  downloadCSR() {
    this.keypairDetails().subscribe((details) => {
      const csrBlob = new Blob([details[0].csr], {
        type: 'application/x-pem-file',
      });
      this.agentConfigurationService.downloadDocument(csrBlob, 'csr.pem');
    });
  }

  onDialogClose($event: { role: 'confirm' | 'cancel' }) {
    this.newCredentialDialogOpen.set(false);
    if ($event.role === 'confirm') {
      this.agentConfigurationService.openGrowl(
        'agentConfiguration.credentialsDetail.newCredentialsRequested',
        'success'
      );
    }
  }
}
