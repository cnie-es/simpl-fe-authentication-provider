import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EchoTierComponent } from './echo-tier.component';
import { EchoService } from '../echo.service';
import { EuiAppShellService } from '@eui/core';
import { of, throwError } from 'rxjs';
import { TranslocoTestingModule } from '@jsverse/transloco';
import en from "../../../assets/i18n/en.json";

describe('EchoTierComponent', () => {
  let component: EchoTierComponent;
  let fixture: ComponentFixture<EchoTierComponent>;
  let echoServiceMock: jest.Mocked<EchoService>;
  let appShellServiceMock: jest.Mocked<EuiAppShellService>;

  // Mock response data
  const mockEchoResponse = {
    // Add expected properties of EchoTResponseDTO here
    message: 'test message'
  };

  beforeEach(async () => {
    // Create mock services
    echoServiceMock = {
      echo: jest.fn().mockReturnValue(of(mockEchoResponse))
    } as any;

    appShellServiceMock = {
      isBlockDocumentActive: false
    } as any;

    await TestBed.configureTestingModule({
      imports: [EchoTierComponent, TranslocoTestingModule.forRoot(
        {
          translocoConfig: {
            availableLangs: ["en"],
            defaultLang: "en",
          },
          langs: {
            en: en
          }
        }
      )],
      providers: [
        { provide: EchoService, useValue: echoServiceMock },
        { provide: EuiAppShellService, useValue: appShellServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EchoTierComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call echo service and update echoResponse on init', () => {
    // Act
    fixture.detectChanges(); // Triggers ngOnInit

    // Assert
    expect(echoServiceMock.echo).toHaveBeenCalled();
    expect(component.echoResponse()).toEqual(mockEchoResponse);
  });

  it('should set isBlockDocumentActive to false after echo service completes', () => {
    // Act
    fixture.detectChanges(); // Triggers ngOnInit

    // Assert
    expect(appShellServiceMock.isBlockDocumentActive).toBe(false);
  });

  it('should handle error case from echo service', () => {
    // Arrange
    echoServiceMock.echo.mockReturnValue(throwError(() => new Error('Mock Error')));

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.echoResponse()).toBeNull();
    expect(appShellServiceMock.isBlockDocumentActive).toBe(false);
  });
});
