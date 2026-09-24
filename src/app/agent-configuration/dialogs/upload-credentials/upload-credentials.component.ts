import {
  AfterViewInit,
  Component,
  DestroyRef,
  inject,
  output,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EUI_DIALOG, EuiDialogComponent } from '@eui/components/eui-dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { EUI_PROGRESS_BAR } from '@eui/components/eui-progress-bar';
import { EUI_FILE_UPLOAD } from '@eui/components/eui-file-upload';
import { map } from 'rxjs/operators';
import { startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AgentConfigurationService } from '../../agent-configuration.service';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpResponse,
} from '@angular/common/http';
import {EuiInputGroupComponent} from "@eui/components/eui-input-group";
import {EuiInputTextComponent} from "@eui/components/eui-input-text";
import {EuiLabelComponent} from "@eui/components/eui-label";
import {EuiMaxLengthDirective} from "@eui/components/directives";
import {EUI_TEXTAREA} from "@eui/components/eui-textarea";

@Component({
  selector: 'app-upload-credentials',
  imports: [
    CommonModule,
    TranslatePipe,
    ReactiveFormsModule,
    ...EUI_DIALOG,
    ...EUI_FILE_UPLOAD,
    ...EUI_PROGRESS_BAR,
    EuiInputGroupComponent,
    EuiInputTextComponent,
    EuiLabelComponent,
    EuiMaxLengthDirective,
    EUI_TEXTAREA,
  ],
  templateUrl: './upload-credentials.component.html',
  styles: ``,
})
export class UploadCredentialsComponent implements AfterViewInit {
  private readonly agentConfigurationService = inject(
    AgentConfigurationService
  );
  form = new FormGroup({
    file: new FormControl(null, Validators.required),
    reason: new FormControl('', Validators.required),
  });
  progress = signal(0);
  dialog: Signal<EuiDialogComponent> = viewChild.required('dialog');
  loading = signal(false);
  dialogClose = output<{ role: 'confirm' | 'cancel' }>();
  destroyRef = inject(DestroyRef);

  ngAfterViewInit() {
    this.dialog().openDialog();
    this.dialog()
      .dialogClose.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.dialogClose.emit({ role: 'cancel' });
      });
    this.form.statusChanges
      .pipe(
        startWith(this.form.status),
        map((status) => status === 'VALID'),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((valid) => {
        if (valid) {
          return this.dialog().enableAcceptButton();
        }
        return this.dialog().disableAcceptButton();
      });
  }

  onAccept() {
    this.loading.set(true);
    this.dialog().disableAcceptButton();
    this.dialog().disableDismissButton();
    this.agentConfigurationService
      .uploadCredentials(this.form.value.file![0], this.form.value.reason)
      .pipe()
      .subscribe({
        next: (event: HttpEvent<number>) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.progress.set(Math.round((event.loaded / event.total) * 100));
          }

          if (event instanceof HttpResponse) {
            this.dialogClose.emit({ role: 'confirm' });
            this.dialog().closeDialog();
            this.progress.set(100);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          this.dialog().enableAcceptButton();
          this.dialog().enableDismissButton();
          if (error.status === 500 || error.status === 401) {
            this.dialog().closeDialog();
          }
        },
      });
  }
}
