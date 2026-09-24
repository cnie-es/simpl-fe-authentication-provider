import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { RouterLink } from '@angular/router';
import { EUI_BUTTON } from '@eui/components/eui-button';
import { EUI_LABEL } from '@eui/components/eui-label';
import { EUI_PAGE } from '@eui/components/eui-page';

@Component({
  selector: 'app-echo-tier-home',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    ...EUI_PAGE,
    ...EUI_BUTTON,
    ...EUI_LABEL,
    RouterLink,
  ],
  templateUrl: './echo-tier-home.component.html',
})
export class EchoTierHomeComponent {}
