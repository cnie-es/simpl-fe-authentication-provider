import { Component, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EUI_PAGE } from '@eui/components/eui-page';
import { TranslatePipe } from '@ngx-translate/core';
import { CredentialsTableComponent } from '../../../credentials-table/credentials-table.component';
import { AgentConfigurationService } from '../../../../agent-configuration.service';
import { CsrExportComponent } from '../../../../dialogs/csr-export/csr-export.component';

@Component({
  selector: 'app-csr',
  imports: [
    CommonModule,
    TranslatePipe,
    CredentialsTableComponent,
    CsrExportComponent,
    ...EUI_PAGE,
  ],
  templateUrl: './csr.component.html',
  styles: ``,
})
export class CsrComponent {
  csrGenerated = output();
  agentsConfigurationService = inject(AgentConfigurationService);
  selectedKeypairId = signal<string | null>(null);
  isDialogExportCsrOpen = computed(() => {
    return !!this.selectedKeypairId();
  });

  onCsrExport(keypairId: string) {
    this.selectedKeypairId.set(keypairId);
  }

  onDialogClose($event: { role: 'confirm' | 'cancel' }) {
    this.selectedKeypairId.set(null);
    if ($event.role === 'confirm') {
      this.csrGenerated.emit();
    }
  }
}
