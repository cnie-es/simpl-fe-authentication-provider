import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { RemoveUnderscorePipe } from '@fe-simpl/core/pipes';
import { EuiTooltipDirective } from '@eui/components/directives';
import { EUI_CHIP } from '@eui/components/eui-chip';
import { EchoResponse } from '@simpl/api-client-authenticationprovider-tier1-v2';

@Component({
  selector: 'app-echo',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    RemoveUnderscorePipe,
    ...EUI_CHIP,
    EuiTooltipDirective,
  ],
  templateUrl: './echo.component.html',
})
export class EchoComponent {
  echoResponse = input.required<EchoResponse>();
}
