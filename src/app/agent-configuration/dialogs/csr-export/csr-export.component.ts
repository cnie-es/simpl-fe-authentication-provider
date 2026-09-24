import {
  AfterViewInit,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EUI_DIALOG, EuiDialogComponent } from '@eui/components/eui-dialog';
import { EUI_INPUT_GROUP } from '@eui/components/eui-input-group';
import { EUI_INPUT_TEXT } from '@eui/components/eui-input-text';
import { EUI_LABEL } from '@eui/components/eui-label';
import { EUI_PROGRESS_BAR } from '@eui/components/eui-progress-bar';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { iif, startWith, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { AgentConfigurationService } from '../../agent-configuration.service';
import { HttpErrorResponse } from '@angular/common/http';
import { EuiMaxLengthDirective } from '@eui/components/directives';

@Component({
  selector: 'app-csr-export',
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    ReactiveFormsModule,
    EuiMaxLengthDirective,
    ...EUI_DIALOG,
    ...EUI_INPUT_GROUP,
    ...EUI_LABEL,
    ...EUI_INPUT_TEXT,
    ...EUI_PROGRESS_BAR,
  ],
  templateUrl: './csr-export.component.html',
  styles: ``,
})
export class CsrExportComponent implements AfterViewInit {
  agentConfigurationService = inject(AgentConfigurationService);
  dialog: Signal<EuiDialogComponent> = viewChild.required('dialog');
  keypairId = input.required<string>();
  loading = signal(false);
  destroyRef = inject(DestroyRef);
  dialogClose = output<{ role: 'confirm' | 'cancel' }>();

  shouldSendCsrToAuthority = input<boolean>(false);

  csrDetailsForm: FormGroup = new FormGroup({
    commonName: new FormControl('', [Validators.required]),
    organization: new FormControl('', [Validators.required]),
    organizationalUnit: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
  });

  ngAfterViewInit() {
    this.dialog().openDialog();

    this.csrDetailsForm.statusChanges
      .pipe(
        startWith(this.csrDetailsForm.status),
        map((formStatus) => formStatus === 'VALID')
      )
      .subscribe((isValid) => {
        if (isValid) {
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

    const generateAndDownloadCsr = this.agentConfigurationService
      .generateCsr(this.keypairId(), this.csrDetailsForm.value)
      .pipe(
        map((response) => {
          const contentDisposition = response.headers.get(
            'Content-Disposition'
          );
          const fileName =
            this.agentConfigurationService.extractFileName(contentDisposition);
          return {
            file: new Blob([response.body!.csr!], { type: 'text/plain' }),
            fileName,
          };
        }),
        tap((file) => {
          this.agentConfigurationService.downloadDocument(
            file.file,
            file.fileName
          );
          this.agentConfigurationService.openGrowl(
            'agentConfiguration.csrGeneration.success'
          );
        })
      );

    const generateAndSendCsr =
      this.agentConfigurationService.requestNewCredential(
        this.keypairId(),
        this.csrDetailsForm.value
      );

    const apiCall = iif(
      () => this.shouldSendCsrToAuthority(),
      generateAndSendCsr,
      generateAndDownloadCsr
    );

    apiCall.subscribe({
      next: () => {
        this.dialog().closeDialog();
        this.dialogClose.emit({ role: 'confirm' });
      },
      error: (error: HttpErrorResponse) => {
        this.dialog().enableAcceptButton();
        this.dialog().enableDismissButton();
        this.loading.set(false);
        if (error.status === 500) {
          this.dialog().closeDialog();
        }
      },
    });
  }
}
