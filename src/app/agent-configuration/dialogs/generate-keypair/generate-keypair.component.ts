import {
  AfterViewInit,
  Component,
  DestroyRef,
  inject,
  output,
  signal,
  Signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EUI_DIALOG, EuiDialogComponent } from '@eui/components/eui-dialog';
import { TranslatePipe } from '@ngx-translate/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EUI_LABEL } from '@eui/components/eui-label';
import { EUI_INPUT_GROUP } from '@eui/components/eui-input-group';
import { startWith } from 'rxjs';
import { map } from 'rxjs/operators';
import { EUI_PROGRESS_BAR } from '@eui/components/eui-progress-bar';
import { AgentConfigurationService } from '../../agent-configuration.service';
import { HttpErrorResponse } from '@angular/common/http';
import { EuiMaxLengthDirective } from '@eui/components/directives';
import { EUI_INPUT_TEXT } from '@eui/components/eui-input-text';
import {notEmpty} from "@shared/utils";

@Component({
  selector: 'app-generate-keypair',
  imports: [
    CommonModule,
    TranslatePipe,
    ReactiveFormsModule,
    EuiMaxLengthDirective,
    ...EUI_DIALOG,
    ...EUI_INPUT_GROUP,
    ...EUI_LABEL,
    ...EUI_PROGRESS_BAR,
    ...EUI_INPUT_TEXT,
  ],
  templateUrl: './generate-keypair.component.html',
  styles: ``,
})
export class GenerateKeypairComponent implements AfterViewInit {
  dialog: Signal<EuiDialogComponent> = viewChild.required('dialog');
  loading = signal(false);
  dialogClose = output<{ role: 'confirm' | 'cancel' }>();
  form: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, notEmpty]),
  });
  destroyRef = inject(DestroyRef);
  private readonly agentConfigurationService = inject(
    AgentConfigurationService
  );

  ngAfterViewInit() {
    this.dialog().openDialog();
    this.form.statusChanges
      .pipe(
        startWith(this.form.status),
        map((stat) => stat === 'VALID')
      )
      .subscribe((status) => {
        if (status) {
          return this.dialog().enableAcceptButton();
        }
        return this.dialog().disableAcceptButton();
      });
    this.dialog()
      .dialogClose.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.dialogClose.emit({ role: 'cancel' });
      });
  }

  onAccept() {
    this.dialog().disableAcceptButton();
    this.dialog().disableDismissButton();
    this.loading.set(true);
    this.agentConfigurationService
      .generateKeypairV2(this.form.value)
      .subscribe({
        next: () => {
          this.dialogClose.emit({ role: 'confirm' });
          this.dialog().closeDialog();
        },
        error: (err: HttpErrorResponse) => {
          this.dialog().enableDismissButton();
          this.dialog().enableAcceptButton();
          this.loading.set(false);
          if (err.status === 500 || err.status === 401) {
            this.dialog().closeDialog();
          }
        },
      });
  }
}
