import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EUI_PAGE } from '@eui/components/eui-page';
import { TranslatePipe } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { EUI_BUTTON } from '@eui/components/eui-button';
import { EUI_ICON } from '@eui/components/eui-icon';
import { EUI_LABEL } from '@eui/components/eui-label';
import { UploadCredentialsComponent } from '../../../../dialogs/upload-credentials/upload-credentials.component';

@Component({
  selector: 'app-credentials',
  imports: [
    CommonModule,
    TranslatePipe,
    ReactiveFormsModule,
    UploadCredentialsComponent,
    ...EUI_PAGE,
    ...EUI_BUTTON,
    ...EUI_ICON,
    ...EUI_LABEL,
  ],
  templateUrl: './credentials.component.html',
  styles: ``,
})
export class CredentialsComponent {
  isDialogUploadOpen = signal(false);
  credentialsUploaded = output();

  onDialogClose($event: { role: 'confirm' | 'cancel' }) {
    this.isDialogUploadOpen.set(false);
    if ($event.role === 'confirm') {
      this.credentialsUploaded.emit();
    }
  }
}
