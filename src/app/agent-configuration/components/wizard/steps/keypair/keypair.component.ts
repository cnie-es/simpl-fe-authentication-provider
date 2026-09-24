import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentConfigurationService } from '../../../../agent-configuration.service';
import { TranslatePipe } from '@ngx-translate/core';
import { EUI_PAGE } from '@eui/components/eui-page';
import { GenerateKeypairComponent } from '../../../../dialogs/generate-keypair/generate-keypair.component';
import { ImportKeypairComponent } from '../../../../dialogs/import-keypair/import-keypair.component';
import { catchError } from 'rxjs';
import { KeypairDropdownButtonComponent } from '../../../keypair-dropdown-button/keypair-dropdown-button.component';

@Component({
  selector: 'app-keypair',
  imports: [
    CommonModule,
    TranslatePipe,
    GenerateKeypairComponent,
    ImportKeypairComponent,
    KeypairDropdownButtonComponent,
    ...EUI_PAGE,
  ],
  templateUrl: './keypair.component.html',
  styles: ``,
})
export class KeypairComponent {
  readonly agentConfigurationService = inject(AgentConfigurationService);
  isDialogGenerateOpen = signal(false);
  isDialogImportOpen = signal(false);
  keyPairGenerated = output();
  private readonly algorithmDetails$ = this.agentConfigurationService
    .getKeypairsAlgorithm()
    .pipe(
      catchError((err) => {
        this.isDialogImportOpen.set(false);
        throw err;
      })
    );

  getAlgorithmDetails() {
    return this.algorithmDetails$;
  }

  importKeypair() {
    this.isDialogImportOpen.set(true);
  }
  generateNewKeypair() {
    this.isDialogGenerateOpen.set(true);
  }

  onDialogClose($event: { role: 'confirm' | 'cancel' }) {
    this.isDialogGenerateOpen.set(false);
    this.isDialogImportOpen.set(false);
    if ($event.role === 'confirm') {
      this.keyPairGenerated.emit();
    }
  }
}
