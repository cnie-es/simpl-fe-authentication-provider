import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { catchError, tap, throwError } from 'rxjs';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { EuiGrowlService } from '@eui/core';
import { EUI_INPUT_GROUP } from '@eui/components/eui-input-group';
import { EUI_LABEL } from '@eui/components/eui-label';
import { EUI_INPUT_TEXT } from '@eui/components/eui-input-text';
import { EUI_BUTTON } from '@eui/components/eui-button';
import { EUI_ICON } from '@eui/components/eui-icon';
import { ParticipantsService } from '@simpl/api-client-authenticationprovider-tier1-v2';

@Component({
  selector: 'app-ping',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    ReactiveFormsModule,
    ...EUI_INPUT_GROUP,
    ...EUI_LABEL,
    ...EUI_INPUT_TEXT,
    ...EUI_BUTTON,
    ...EUI_ICON,
  ],
  templateUrl: './ping.component.html',
})
export class PingComponent {
  fqdnControl = new FormControl('', [Validators.required]);
  loading = false;

  readonly #euiGrowlService = inject(EuiGrowlService);

  constructor(
    private readonly _participantsService: ParticipantsService,
    private readonly _translocoService: TranslocoService
  ) {}

  onPing() {
    if (this.fqdnControl.valid) {
      const value = this.fqdnControl.value;
      this.loading = true;
      this._participantsService
        .pingAgent(value)
        .pipe(
          tap(() => {
            this.#euiGrowlService.growl(
              {
                severity: 'info',
                summary: this._translocoService.translate(
                  'ping.connectionSuccess'
                ),
              },
              false,
              false,
              5000
            );
            this.loading = false;
          }),
          catchError((err) => {
            this.#euiGrowlService.growl(
              {
                severity: 'danger',
                summary: this._translocoService.translate(
                  'ping.connectionNotSuccess'
                ),
              },
              false,
              false,
              5000
            );
            this.loading = false;
            return throwError(() => err);
          })
        )
        .subscribe();
    }
  }
}
