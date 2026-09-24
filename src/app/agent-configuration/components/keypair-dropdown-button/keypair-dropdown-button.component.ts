import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EUI_BUTTON } from '@eui/components/eui-button';
import { EUI_DROPDOWN } from '@eui/components/eui-dropdown';
import { EUI_ICON } from '@eui/components/eui-icon';
import { EUI_LABEL } from '@eui/components/eui-label';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-keypair-dropdown-button',
  imports: [
    CommonModule,
    TranslatePipe,
    ...EUI_DROPDOWN,
    ...EUI_LABEL,
    ...EUI_ICON,
    ...EUI_BUTTON,
  ],
  templateUrl: './keypair-dropdown-button.component.html',
  styles: ``,
})
export class KeypairDropdownButtonComponent {
  generateNew = output();
  importNew = output();
}
