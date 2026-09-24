import {TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {CredentialsService} from '@simpl/api-client-authenticationprovider-tier1-v2';
import Keycloak from 'keycloak-js';
import {of, throwError} from 'rxjs';
import {EuiAppShellService} from "@eui/core";
import {TranslateModule} from "@ngx-translate/core";
import {TranslocoTestingModule} from '@jsverse/transloco';
import {EuiAppComponent} from "@eui/components/layout";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, signal} from "@angular/core";
import {HttpErrorResponse} from "@angular/common/http";
import {AppStarterService} from "./app-starter.service";
import {DateAdapter} from "@angular/material/core";

const mockCredentialsService =  {
  downloadActiveCredential() {
    return of({id: 1});
  }
}

class MockKeycloak {
  authenticated = true;
  logout = jest.fn(() => Promise.resolve());
}

let mockAppStarterService = {
  isDocumentBlocked: signal(false)
};

describe('AppComponent', () => {
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        TranslocoTestingModule.forRoot({
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
          langs: {},
        }),
      ],
      providers: [
        { provide: EuiAppShellService, useValue: { isBlockDocumentActive: false, setState: jest.fn(), getState: jest.fn(() => of('en')), state: { languages: [] } }},
        { provide: CredentialsService, useValue: mockCredentialsService },
        { provide: AppStarterService, useValue: mockAppStarterService },
        { provide: Keycloak, useClass: MockKeycloak },
        { provide: DateAdapter, useValue: { setLocale: jest.fn() } },
      ]
    }).overrideComponent( AppComponent, {
      add: {
        schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
      },
      remove: {
        imports: [EuiAppComponent]
      }
    }).compileComponents();
    component = TestBed.createComponent(AppComponent).componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should add splash screen hidden class if authenticated', () => {
    document.body.classList.remove('simpl-splash-screen-hidden');
    component.keycloak.authenticated = true;
    expect(document.body.classList.contains('simpl-splash-screen-hidden')).toBe(false);
  });

  it('should not add splash screen hidden class if not authenticated', () => {
    component.keycloak.authenticated = false;
    expect(document.body.classList.contains('simpl-splash-screen-hidden')).toBe(true);
  });

    it('should call keycloak.logout with default redirection URL on logOut', async () => {
        const spy = jest.spyOn(component.keycloak, 'logout');
        Object.defineProperty(window, 'location', {
            value: {origin: 'http://localhost', pathname: '/'},
            writable: true,
        });

        await component.logOut();
        expect(spy).toHaveBeenCalledWith({
            redirectUri: 'http://localhost/',
        });
    });

    it('should call keycloak.logout with participant-utility path on logOut', async () => {
        const spy = jest.spyOn(component.keycloak, 'logout');
        Object.defineProperty(window, 'location', {
            value: {origin: 'http://localhost', pathname: '/participant-utility'},
            writable: true,
        });

        await component.logOut();
        expect(spy).toHaveBeenCalledWith({
            redirectUri: 'http://localhost/participant-utility/',
        });
    });

  it('activeCredential$ should emit true when active credential exist', (done) => {
    component.activeCredential$.subscribe(value => {
      expect(value).toBe(true);
      done();
    })
  });


  it('activeCredential$ should emit false when active credential does not exist', (done) => {
    mockCredentialsService.downloadActiveCredential = jest.fn().mockReturnValue(throwError(() => new HttpErrorResponse({error: 'No active credential found', status: 404})));
    const newComponent = TestBed.createComponent(AppComponent).componentInstance;
    newComponent.activeCredential$.subscribe(value => {
      expect(value).toBe(false);
      done();
    });
  });

  it('activeCredential$ should throw error when active credential return 500', (done) => {
    mockCredentialsService.downloadActiveCredential = jest.fn().mockReturnValue(throwError(() => new HttpErrorResponse({error: 'Server error', status: 500})));
    const newComponent = TestBed.createComponent(AppComponent).componentInstance;
    newComponent.activeCredential$.subscribe({
      error: (error) => {
        expect(error).toBeDefined();
        done();
      }
    });
  });

});
