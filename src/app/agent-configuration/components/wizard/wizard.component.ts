import { AfterViewInit, Component, inject, viewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  EUI_WIZARD,
  EuiWizardStep,
  EuiWizardStepComponent,
} from '@eui/components/eui-wizard';
import { TranslatePipe } from '@ngx-translate/core';
import { KeypairComponent } from './steps/keypair/keypair.component';
import { WizardService } from './wizard.service';
import { delay, tap } from 'rxjs';
import { CsrComponent } from './steps/csr/csr.component';
import { CredentialsComponent } from './steps/credentials/credentials.component';

@Component({
  selector: 'app-wizard',
  imports: [
    CommonModule,
    TranslatePipe,
    KeypairComponent,
    CsrComponent,
    CredentialsComponent,
    ...EUI_WIZARD,
  ],
  providers: [WizardService],
  templateUrl: './wizard.component.html',
})
export class WizardComponent implements AfterViewInit {
  wizardService = inject(WizardService);
  wizardSteps = viewChildren(EuiWizardStepComponent);

  onSelectStep($event: EuiWizardStep) {
    this.wizardService.activeStepIndex.set($event.index);
  }

  ngAfterViewInit() {
    this.wizardService
      .getActiveWizardStepIndex()
      .pipe(
        tap((activeIndex) =>
          this.wizardService.activeStepIndex.set(activeIndex)
        ),
        delay(10)
      )
      .subscribe((activeStepIndex) => {
        this.wizardSteps().map((step, index) => {
          if (index + 1 > activeStepIndex) step.isDisabled = true;
          if (index + 1 < activeStepIndex) step.isCompleted = true;
        });
      });
  }

  onKeyPairGenerated() {
    this.completeStep();
  }

  onCsrGenerated() {
    this.completeStep();
  }

  onCredentialsUploaded() {
    this.wizardService.agentConfigurationService.setActiveKeyPair();
  }

  private completeStep() {
    const actualStep =
      this.wizardSteps()[this.wizardService.activeStepIndex() - 1];
    const nextStep = this.wizardSteps()[this.wizardService.activeStepIndex()];
    actualStep.isCompleted = true;
    if (nextStep.isDisabled) nextStep.isDisabled = false;
    this.wizardService.activeStepIndex.update((activeIndex) => activeIndex + 1);
  }
}
