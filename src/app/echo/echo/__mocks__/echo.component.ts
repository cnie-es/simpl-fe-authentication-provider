import { Component, Input } from "@angular/core";

@Component({
  selector: "app-echo",
  standalone: true,
  imports: [],
  template: '<div data-testid="mock-echo-component">mock-response-passing</div>',
})
export class EchoComponent {
  @Input()
  echoResponse: unknown;
}

