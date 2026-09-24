import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  InputSignal,
  output,
  Signal,
  signal,
  viewChild,
  WritableSignal,
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
import { startWith } from 'rxjs';
import { map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EUI_TEXTAREA } from '@eui/components/eui-textarea';
import { EUI_BUTTON } from '@eui/components/eui-button';
import { EUI_ICON } from '@eui/components/eui-icon';
import { EUI_ICON_BUTTON_EXPANDER } from '@eui/components/eui-icon-button-expander';
import { EUI_CHIP } from '@eui/components/eui-chip';
import { AgentKeypairEncryptionAlgorithm } from '@simpl/api-client-authenticationprovider-tier1-v2';
import { AgentConfigurationService } from '../../agent-configuration.service';
import { HttpErrorResponse } from '@angular/common/http';
import { EUI_ICON_BUTTON } from '@eui/components/eui-icon-button';
import {
  EuiMaxLengthDirective,
  EuiTooltipDirective,
} from '@eui/components/directives';
import { EUI_FEEDBACK_MESSAGE } from '@eui/components/eui-feedback-message';
import {notEmpty} from "@shared/utils";

const CODE_INSTRUCTIONS = `openssl ecparam -genkey -name prime256v1 -noout -out ec_private_key.pem
openssl ec -in ec_private_key.pem -pubout -out ec_public_key.pem
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in ec_private_key.pem -out ec_private_key_to_import.pem
openssl ec -in ec_private_key.pem -pubout -outform PEM -out ec_public_key_to_import.pem`;

@Component({
  selector: 'app-import-keypair',
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    ReactiveFormsModule,
    EuiTooltipDirective,
    EuiMaxLengthDirective,
    ...EUI_DIALOG,
    ...EUI_CHIP,
    ...EUI_ICON,
    ...EUI_ICON_BUTTON_EXPANDER,
    ...EUI_ICON_BUTTON,
    ...EUI_FEEDBACK_MESSAGE,
    ...EUI_INPUT_GROUP,
    ...EUI_LABEL,
    ...EUI_INPUT_TEXT,
    ...EUI_TEXTAREA,
    ...EUI_BUTTON,
    ...EUI_PROGRESS_BAR,
  ],
  templateUrl: './import-keypair.component.html',
  styles: ``,
})
export class ImportKeypairComponent implements AfterViewInit {
  privateFileInput: Signal<ElementRef<HTMLInputElement>> =
    viewChild.required('fileInputPrivate');
  publicFileInput: Signal<ElementRef<HTMLInputElement>> =
    viewChild.required('fileInputPublic');
  loading = signal<boolean>(false);
  dialog: Signal<EuiDialogComponent> = viewChild.required('dialog');
  importForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, notEmpty]),
    privateKey: new FormControl('', [Validators.required, notEmpty]),
    publicKey: new FormControl('', [Validators.required, notEmpty]),
  });
  destroyRef = inject(DestroyRef);
  dialogClose = output<{ role: 'confirm' | 'cancel' }>();
  keyPairAlgorithm: InputSignal<AgentKeypairEncryptionAlgorithm> =
    input.required();

  privateKeyUploaded = signal(false);
  privateFileInfo: WritableSignal<{
    name: string | null;
    size: number | null;
  }> = signal({
    name: null,
    size: null,
  });
  publicKeyUploaded = signal(false);
  publicFileInfo: WritableSignal<{ name: string | null; size: number | null }> =
    signal({
      name: null,
      size: null,
    });
  codeInstructions = CODE_INSTRUCTIONS;
  private readonly agentConfigurationService = inject(
    AgentConfigurationService
  );

  showSuccesfulCopy = signal(false);

  get nameError() {
    return (
      this.importForm.get('name').hasError('required') &&
      this.importForm.get('name').touched
    );
  }

  get privateKeyError() {
    return (
      this.importForm.get('privateKey').hasError('required') &&
      this.importForm.get('privateKey').touched
    );
  }

  get publicKeyError() {
    return (
      this.importForm.get('publicKey').hasError('required') &&
      this.importForm.get('publicKey').touched
    );
  }

  ngAfterViewInit() {
    this.dialog().openDialog();
    this.importForm.statusChanges
      .pipe(
        startWith(this.importForm.status),
        map((status) => status === 'VALID')
      )
      .subscribe((valid) => {
        if (valid) {
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

  onFileUploaded(event: Event, key: 'private' | 'public'): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result as string;
        this.importForm.patchValue({
          [key + 'Key']: fileContent,
        });
        this.importForm.get(key + 'Key')?.disable();
        if (key === 'private') {
          this.privateKeyUploaded.set(true);
          this.privateFileInfo.set({ name: file.name, size: file.size });
        } else {
          this.publicKeyUploaded.set(true);
          this.publicFileInfo.set({ name: file.name, size: file.size });
        }
      };
      reader.readAsText(file);
    }
  }

  onFileDeleted(key: 'private' | 'public') {
    this.importForm.patchValue({
      [key + 'Key']: '',
    });
    this.importForm.get(key + 'Key')?.enable();
    if (key === 'private') {
      this.privateKeyUploaded.set(false);
      this.privateFileInfo.set({
        name: null,
        size: null,
      });
      this.privateFileInput().nativeElement.value = '';
    } else {
      this.publicKeyUploaded.set(false);
      this.publicFileInfo.set({
        name: null,
        size: null,
      });
      this.publicFileInput().nativeElement.value = '';
    }
  }

  onAccept() {
    this.dialog().disableAcceptButton();
    this.dialog().disableDismissButton();
    this.loading.set(true);
    this.agentConfigurationService
      .importKeyPairV2(this.importForm.getRawValue())
      .subscribe({
        next: () => {
          this.dialog().closeDialog();
          this.dialogClose.emit({ role: 'confirm' });
        },
        error: (err: HttpErrorResponse) => {
          this.dialog().enableAcceptButton();
          this.dialog().enableDismissButton();
          this.loading.set(false);
          if (err.status === 500 || err.status === 401) {
            this.dialog().closeDialog();
          }
        },
      });
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.codeInstructions).then(() => {
      this.showSuccesfulCopy.set(true);
      setTimeout(() => {
        this.showSuccesfulCopy.set(false);
      }, 2000);
    });
  }
}
