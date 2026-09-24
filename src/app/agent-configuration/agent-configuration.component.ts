import { Component, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EUI_PAGE } from '@eui/components/eui-page';
import { AgentConfigurationService } from './agent-configuration.service';
import { WizardComponent } from './components/wizard/wizard.component';
import { CredentialsTableComponent } from './components/credentials-table/credentials-table.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { EuiGrowlService } from '@eui/core';
import { FiltersComponent } from './components/filters/filters.component';
import { EUI_BUTTON } from '@eui/components/eui-button';
import { EUI_LABEL } from '@eui/components/eui-label';
import { UploadCredentialsComponent } from './dialogs/upload-credentials/upload-credentials.component';
import { GenerateKeypairComponent } from './dialogs/generate-keypair/generate-keypair.component';
import { ImportKeypairComponent } from './dialogs/import-keypair/import-keypair.component';
import { catchError, tap } from 'rxjs';
import { CsrExportComponent } from './dialogs/csr-export/csr-export.component';
import { KeypairDropdownButtonComponent } from './components/keypair-dropdown-button/keypair-dropdown-button.component';
import { Router } from '@angular/router';
import { EUI_SLIDE_TOGGLE } from '@eui/components/eui-slide-toggle';
import { AutomaticRenewalsService } from '@simpl/api-client-authenticationprovider-tier1-v2';
import { map } from 'rxjs/operators';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-agent-configuration',
  imports: [
    CommonModule,
    WizardComponent,
    CredentialsTableComponent,
    TranslatePipe,
    FiltersComponent,
    UploadCredentialsComponent,
    GenerateKeypairComponent,
    ImportKeypairComponent,
    CsrExportComponent,
    KeypairDropdownButtonComponent,
    ...EUI_PAGE,
    ...EUI_BUTTON,
    ...EUI_LABEL,
    EUI_SLIDE_TOGGLE,
    ReactiveFormsModule,
  ],
  templateUrl: './agent-configuration.component.html',
})
export class AgentConfigurationComponent {
  isDialogUploadOpen = signal(false);
  isDialogGenerateOpen = signal(false);
  isDialogImportOpen = signal(false);
  readonly agentsConfigurationService = inject(AgentConfigurationService);
  readonly router = inject(Router);
  keyPairGenerated = output();
  keypairId = signal<string | null>(null);
  isCsrDialogOpen = computed(() => {
    return !!this.keypairId();
  });
  automaticRenewalService = inject(AutomaticRenewalsService);
  private readonly growlService = inject(EuiGrowlService);
  private readonly translateService = inject(TranslateService);

  automaticRenewalForm = new FormGroup({
    set: new FormControl(false),
  });

  automaticRenewalsEnabled = this.automaticRenewalService
    .getAutomaticRenewal()
    .pipe(
      map((conf) => {
        return !!conf.set;
      }),
      tap((set) => {
        this.automaticRenewalForm.patchValue(
          set ? { set: true } : { set: false }
        );
      })
    )
    .subscribe();

  private readonly algorithm$ =
    this.agentsConfigurationService.getKeypairsAlgorithm();

  getAlgorithm() {
    return this.algorithm$.pipe(
      catchError((err) => {
        this.isDialogImportOpen.set(false);
        throw err;
      })
    );
  }

  updateAndInstallCredential() {
    this.isDialogUploadOpen.set(true);
  }

  onDialogClose($event: { role: 'confirm' | 'cancel' }) {
    this.isDialogUploadOpen.set(false);
    if ($event.role === 'confirm') {
      this.agentsConfigurationService.searchKeyPairs({
        sort: this.agentsConfigurationService.defaultTableSorting,
      });
    }
  }

  onCsrDialogClose() {
    this.keypairId.set(null);
  }

  onDialogKeypairClose($event: { role: 'confirm' | 'cancel' }) {
    this.isDialogGenerateOpen.set(false);
    this.isDialogImportOpen.set(false);
    if ($event.role === 'confirm') {
      this.agentsConfigurationService.searchKeyPairs({
        sort: this.agentsConfigurationService.defaultTableSorting,
      });
    }
  }

  generateNewKeypair() {
    this.isDialogGenerateOpen.set(true);
  }

  importKeypair() {
    this.isDialogImportOpen.set(true);
  }

  onNavigateKeypairDetail($event: string) {
    this.router.navigate(['/agent-configuration/keypair', $event]);
  }

  toggleAutomaticRenewal(event: boolean) {
    this.automaticRenewalService
      .updateAutomaticRenewal({ set: event })
      .subscribe({
        error: () => {
          this.growlService.growl(
            {
              severity: 'danger',
              summary: this.translateService.instant('common.actionFailed'),
              detail: this.translateService.instant(
                'agentConfiguration.automaticRenewalConfiguration.errorMessage'
              ),
            },
            false,
            false,
            5000
          );
          this.automaticRenewalForm.patchValue(
            { set: !event },
            { emitEvent: false }
          );
        },
      });
  }
}
