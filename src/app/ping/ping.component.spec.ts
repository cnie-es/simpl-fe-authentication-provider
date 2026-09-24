import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PingComponent } from './ping.component';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { EchoService } from '../echo/echo.service';
import { ParticipantsService } from '@simpl/api-client-authenticationprovider-tier1-v2';
import en from "../../assets/i18n/en.json";


describe('PingComponent', () => {
  let component: PingComponent;
  let fixture: ComponentFixture<PingComponent>;
  let participantsServiceMock: any;
  let echoServiceMock: any;

  beforeEach(async () => {
    participantsServiceMock = {
      pingAgent: jest.fn()
    };
    echoServiceMock = {
      hasCredential: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        PingComponent,
        TranslocoTestingModule.forRoot({
          translocoConfig: {
            availableLangs: ["en"],
            defaultLang: "en",
          },
          langs: {
            en: en
          }
        }),
      ],
      providers: [
        { provide: ParticipantsService, useValue: participantsServiceMock },
        { provide: EchoService, useValue: echoServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call ping service if form is invalid', () => {
    component.onPing();
    expect(participantsServiceMock.pingAgent).not.toHaveBeenCalled();
  });

  it('should call ping service if form is valid', () => {
    const testFqdn = 'example.com';

    component.fqdnControl.setValue(testFqdn);
    participantsServiceMock.pingAgent.mockReturnValue(of({}));

    component.onPing();

    expect(participantsServiceMock.pingAgent).toHaveBeenCalledWith(testFqdn);
  });



  it('should handle error from ping service', () => {
    const testFqdn = 'example.com';
    const errorResponse = new Error('Ping failed');

    component.fqdnControl.setValue(testFqdn);
    participantsServiceMock.pingAgent.mockReturnValue(throwError(() => errorResponse));

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    component.onPing();

    expect(participantsServiceMock.pingAgent).toHaveBeenCalledWith(testFqdn);
    expect(consoleLogSpy).not.toHaveBeenCalledWith(errorResponse);
  });

});
