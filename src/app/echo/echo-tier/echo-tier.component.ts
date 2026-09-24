import {
  Component,
  OnInit,
  inject,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { EchoService } from '../echo.service';
import { EchoComponent } from "../echo/echo.component";
import {
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { EchoResponse } from '@simpl/api-client-authenticationprovider-tier1-v2';

@Component({
  selector: "app-echo-tier",
  standalone: true,
  imports: [
    CommonModule,
    EchoComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./echo-tier.component.html"
})
export class EchoTierComponent implements OnInit {
  public echoResponse = signal<EchoResponse | null>(null);
  private readonly echoService = inject(EchoService);

  ngOnInit() {
    this.echoService.echo()
      .subscribe(
      res => {
        this.echoResponse.set(res);
      }
    )
  }
}
