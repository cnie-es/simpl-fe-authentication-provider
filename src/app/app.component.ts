import {Component, inject} from '@angular/core';
import {EUI_LANGUAGE_SELECTOR} from "@eui/components/eui-language-selector";
import {EUI_USER_PROFILE} from "@eui/components/eui-user-profile";
import {EUI_ICON} from "@eui/components/eui-icon";
import {EUI_APP_TOOLBAR, EUI_APP_TOP_MESSAGE, EUI_TOOLBAR, EuiAppComponent} from "@eui/components/layout";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import Keycloak from "keycloak-js";
import {catchError, of, shareReplay, throwError} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {CredentialsService} from "@simpl/api-client-authenticationprovider-tier1-v2";
import {AsyncPipe} from "@angular/common";
import {map} from "rxjs/operators";
import {EUI_LABEL} from "@eui/components/eui-label";
import {AppStarterService} from "./app-starter.service";
import {EUI_BLOCK_CONTENT} from "@eui/components/eui-block-content";

/// EDNEL imports (start)
import { EuiAppShellService, type EuiLanguage } from '@eui/core';
import { TranslocoService } from '@jsverse/transloco';
import { distinctUntilChanged, filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateAdapter } from '@angular/material/core';
/// EDNEL imports (end)

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
  imports: [
    TranslateModule,
    ...EUI_ICON,
    ...EUI_USER_PROFILE,
    ...EUI_LANGUAGE_SELECTOR,
    ...EUI_APP_TOP_MESSAGE,
    ...EUI_APP_TOOLBAR,
    ...EUI_TOOLBAR,
    ...EUI_LABEL,
    EuiAppComponent,
    AsyncPipe,
    EUI_BLOCK_CONTENT,
  ],
})
export class AppComponent {
  // EDNEL: Inject translation related services (start)
  private readonly appShellService = inject(EuiAppShellService);
  private readonly translocoService = inject(TranslocoService);
  private readonly dateAdapter = inject(DateAdapter);
  private readonly translateService = inject(TranslateService);
  private readonly langSelectorObserver = new MutationObserver(() => this.updateLanguageSelectorHeadings());
  // EDNEL: Inject translation related services (end)

  appStarterService= inject(AppStarterService);

  _credentialsServiceV2 = inject(CredentialsService)

  activeCredential$ = this._credentialsServiceV2
    .downloadActiveCredential()
    .pipe(
      shareReplay(1),
      map(credential => credential !== null),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          return of(false);
        }
        return throwError(() => err);
      })
    );


  constructor() {
    if (this.keycloak.authenticated) {
      document.body.classList.add('simpl-splash-screen-hidden');
    }

    // EDNEL translations (start)
    this.appShellService.getState<string>('activeLanguage')
      .pipe(
        filter(Boolean),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((lang: string) => {
        this.translocoService.setActiveLang(lang);
        // Map locale to Moment.js format (va-ES -> ca, es-ES -> es, etc.)
        const momentLocale = this.mapToMomentLocale(lang);
        this.dateAdapter.setLocale(momentLocale);
      });
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.translateLanguageLabels()
      });

    // Initial translation of language labels
    this.translateLanguageLabels()
    // EDNEL translations (end)
  }


  readonly keycloak: Keycloak = inject(Keycloak);
  logOut() {
    const baseUrl = window.location.origin;
    const path = window.location.pathname.includes('/participant-utility')
      ? '/participant-utility/'
      : '/';

    this.keycloak.logout({ redirectUri: `${baseUrl}${path}` }).then();
  }


  ngAfterViewInit(): void {
    this.langSelectorObserver.observe(document.body, { childList: true, subtree: true });
  }

  ngOnDestroy(): void {
    this.langSelectorObserver?.disconnect();
  }

  // EDNEL: Map Angular locale to Moment.js locale format (start)
  private mapToMomentLocale(angularLocale: string): string {
    // Valencian uses Catalan locale in Moment.js
    if (angularLocale === 'va-ES' || angularLocale === 'va') {
      return 'ca';
    }
    // Remove country code suffix (e.g., es-ES -> es, ca-ES -> ca)
    const locale = angularLocale.split('-')[0];
    return locale;
  }
  // EDNEL: Map Angular locale to Moment.js locale format (end)

  private translateLanguageLabels(){
    const updatedLanguages = (this.appShellService.state.languages as EuiLanguage[])
      .map(({ code, label }) => {
        let newLabel: string = this.translateService.instant('languageSelector.languageLabels.' + code);
        // If the translation key is missing, keep the original label
        if (newLabel.includes('.')){
          newLabel = label;
        }
        return({
        code,
        label: newLabel,
      })});
    this.appShellService.setState({...this.appShellService.state, languages: updatedLanguages})
  }

  private updateLanguageSelectorHeadings(): void {
    const headings = document.querySelectorAll('eui-modal-selector h4');
    if (headings.length !== 2) return;
    // Disconnect the observer to prevent infinite loops when updating the headings
    this.langSelectorObserver?.disconnect();
    headings[0].textContent = this.translateService.instant('languageSelector.headings.euOfficial');
    headings[1].textContent = this.translateService.instant('languageSelector.headings.nonEuOfficial');
    // Re-observe the DOM after updating the headings
    this.langSelectorObserver?.observe(document.body, { childList: true, subtree: true });
  }
}
