import { inject, Injectable, signal } from '@angular/core';
import { AgentConfigurationService } from '../../agent-configuration.service';
import { map, take } from 'rxjs/operators';

@Injectable()
export class WizardService {
  agentConfigurationService = inject(AgentConfigurationService);
  wizardSteps = {
    KEYPAIR: 1,
    CSR: 2,
    CREDENTIALS: 3,
  } as const;
  activeStepIndex = signal(0);

  getActiveWizardStepIndex() {
    return this.agentConfigurationService.getKeyPairs().pipe(
      map((response) => {
        const keyPairHasCSR = response.items.some(
          (keyPair) => keyPair.csr
        )
          ? this.wizardSteps.CREDENTIALS
          : this.wizardSteps.CSR;
        return response.items.length === 0
          ? this.wizardSteps.KEYPAIR
          : keyPairHasCSR;
      }),
      take(1)
    );
  }
}
