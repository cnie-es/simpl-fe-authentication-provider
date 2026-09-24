import {
  HttpErrorResponse,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import {
  catchError,
  Observable,
  of,
  shareReplay,
  tap,
  throwError,
} from 'rxjs';
import { map } from 'rxjs/operators';
import { EuiGrowlService } from '@eui/core';
import { EuiPaginationEvent } from '@eui/components/eui-paginator';
import { Sort } from '@eui/components/eui-table-v2';
import {
  CredentialsByKeyPairPagedRequest,
  CredentialsService as CredentialsServiceV2,
  CredentialStatus,
  CsrRequest,
  KeyPairImportRequest,
  KeyPairPagedRequest,
  KeyPairRequest,
  KeypairsService,
} from '@simpl/api-client-authenticationprovider-tier1-v2';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  EuiDateRangeSelectorDates,
} from '@eui/components/eui-date-range-selector';
import { Router } from '@angular/router';
import {startEndDateRangeValidator} from "@shared/utils";

@Injectable({ providedIn: 'root' })
export class AgentConfigurationService {
  csrFiltersChips: WritableSignal<Array<{ field: string; value: string }>> =
    signal([]);

  defaultTableSorting: Sort[] = [
    {
      sort: 'creationTimestamp',
      order: 'desc',
    },
  ];

  private readonly growlService = inject(EuiGrowlService);
  private readonly translateService = inject(TranslateService);
  private readonly _credentialsServiceV2 = inject(CredentialsServiceV2);
  private readonly keypairsService = inject(KeypairsService);
  private readonly router = inject(Router);
  private hasActiveKeypair$ = this.keypairsService
    .isActiveKeyPairPresent('response')
    .pipe(
      map((res: HttpResponse<unknown>) => {
        return res.status === 204;
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          return of(false);
        }
        throw err;
      })
    );

  activeCredential$ = this._credentialsServiceV2
    .downloadActiveCredential()
    .pipe(
      shareReplay(1),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          return of(null);
        }
        return throwError(() => err);
      }),
    );

  private readonly keypairsAlgorithm$ = this.keypairsService
    .getAgentEncryptionAlgorithm()
    .pipe(
      shareReplay()
    );

  private keyPairs$ = this.keypairsService
    .listKeypairs()

  csrFiltersForm = new FormGroup({
    active: new FormControl(),
    name: new FormControl(),
    dateRange: new FormControl<EuiDateRangeSelectorDates>(
      {
        value: {
          startRange: null,
          endRange: null,
        },
        disabled: false,
      },
      [startEndDateRangeValidator]
    ),
  });

  getActiveKeypair() {
    return this.hasActiveKeypair$;
  }

  setActiveKeyPair() {
    this.hasActiveKeypair$ = this.keypairsService
      .isActiveKeyPairPresent('response')
      .pipe(
        map((res: HttpResponse<unknown>) => {
          return res.status === 204;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 404) {
            return of(false);
          }
          throw err;
        })
      );
  }

  setActiveCredential(){
    this.activeCredential$ = this._credentialsServiceV2
      .downloadActiveCredential()
      .pipe(
        shareReplay(1),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 404) {
            return of(null);
          }
          return throwError(() => err);
        }),
      )
  }

  getKeyPairs() {
    return this.keyPairs$;
  }

  getKeypairsAlgorithm() {
    return this.keypairsAlgorithm$;
  }

  searchKeyPairs(searchParams?: {
    pagination?: EuiPaginationEvent;
    sort?: Sort[];
  }) {
    const { pagination, sort } = searchParams || {};
    const { name, active } = this.csrFiltersForm.getRawValue();
    const dateRangeValue = this.csrFiltersForm.get('dateRange')?.value;
    const creationTimestampFrom = dateRangeValue?.startRange
      ? dateRangeValue.startRange.toISOString()
      : undefined;
    const creationTimestampTo = dateRangeValue?.endRange
      ? dateRangeValue.endRange.clone().add(1, 'days')?.toISOString()
      : undefined;
    const filters: KeyPairPagedRequest = {
      sort: sort?.map(
        (sortItem) => `${sortItem.order === 'desc' ? '-' : ''}${sortItem.sort}`
      ),
      page: pagination?.page,
      pageSize: pagination?.pageSize,
      name,
      active,
      creationTimestampFrom,
      creationTimestampTo,
    };

      this.keyPairs$ = this.keypairsService
      .listKeypairs(filters)
  }

  generateKeypairV2(data: KeyPairRequest) {
    return this.keypairsService.createKeypair(data).pipe(
      tap(() => this.openGrowl('agentConfiguration.keypairGeneration.success')),
      catchError((err) => {
        this.openGrowl('agentConfiguration.keypairGeneration.error', 'danger');
        throw err;
      })
    );
  }

  importKeyPairV2(data: KeyPairImportRequest) {
    return this.keypairsService.importKeyPair(data).pipe(
      tap(() => this.openGrowl('agentConfiguration.importKeypair.success')),
      catchError((err) => {
        this.openGrowl('agentConfiguration.importKeypair.error', 'danger');
        throw err;
      })
    );
  }

  generateCsr(keyPairId: string, csrDetails: CsrRequest) {
    return this.keypairsService
      .generateCSRByKeyPair(keyPairId, csrDetails, 'response')
  }

  requestNewCredential(keyPairId: string, csrDetails: CsrRequest) {
    return this._credentialsServiceV2.requestCredentialsRenewal(keyPairId, csrDetails)
  }

  downloadDocument(file: Blob, fileName: string) {
    const objectURL = URL.createObjectURL(file);
    const fileLink = document.createElement('a');
    fileLink.href = objectURL;
    fileLink.download = fileName;
    fileLink.click();
    URL.revokeObjectURL(objectURL);
  }

  uploadCredentials(file: File, reason: string): Observable<HttpEvent<number>> {
    return new Observable((observer) => {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        this._credentialsServiceV2
          .uploadCredential({content, reason}, 'events', true)
          .pipe(
            catchError((err) => {
              this.openGrowl('agentConfiguration.credentialsImport.error', 'danger');
              observer.error(err);
              return [];
            }),
            tap((event) => {
              if (event instanceof HttpResponse) {
                this.openGrowl('agentConfiguration.credentialsImport.success');
              }
            })
          )
          .subscribe({
            next: (event) => observer.next(event),
            error: (err) => observer.error(err),
            complete: () => observer.complete(),
          });
      };
      reader.onerror = (err) => observer.error(err);
      reader.readAsText(file);
    });
  }

  extractFileName(contentDisposition: string | null): string {
    if (!contentDisposition) {
      return 'csr.pem';
    }
    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
      contentDisposition
    );
    return matches?.[1] ? matches[1].replace(/['"]/g, '') : 'csr.pem';
  }

  openGrowl(
    detailMessageKey: string,
    severity: 'success' | 'danger' = 'success'
  ) {
    this.growlService.growl(
      {
        severity: severity,
        summary: this.translateService.instant(
          severity === 'success'
            ? 'common.actionCompleted'
            : 'common.actionFailed'
        ),
        detail: this.translateService.instant(detailMessageKey),
      },
      false,
      false,
      5000
    );
  }

  resetFilters() {
    this.csrFiltersForm.patchValue({
      active: '',
      name: '',
      dateRange: {
        startRange: null,
        endRange: null,
      },
    });
    this.csrFiltersForm.updateValueAndValidity();
    this.updateChips();
  }

  updateChips() {
    const chips = Object.keys(this.csrFiltersForm.controls).flatMap((field) => {
      if (field === 'dateRange') {
        const chipsArray = [];
        const dateRange = this.csrFiltersForm.get(field)
          ?.value as unknown as EuiDateRangeSelectorDates;
        if (dateRange?.startRange) {
          chipsArray.push({
            field: 'updateTimestampFrom',
            value: dateRange.startRange.format('DD/MM/YYYY'),
          });
        }
        if (dateRange?.endRange) {
          chipsArray.push({
            field: 'updateTimestampTo',
            value: dateRange.endRange.format('DD/MM/YYYY'),
          });
        }
        return chipsArray;
      } else {
        const value = this.csrFiltersForm.get(field)?.value;
        return value ? [{ field, value }] : [];
      }
    });
    this.csrFiltersChips.set(chips);
  }

  getKeypairDetails(id: string) {
    return this.keypairsService.getKeypair(id).pipe(
      catchError((err) => {
        if (err.status === 404) {
          const errorInfo = {
            status: err.status,
            statusText: err.statusText,
            name: err.name,
            message: err.message,
            url: err.url,
            err: err.error
          };

          this.router.navigate(['/error'], {
            state: { error: errorInfo }
          });
        }


        this.openGrowl(
          'agentConfiguration.credentialsDetail.credentialsDetailError',
          'danger'
        );
        throw err;
      })
    );
  }

  getCredentialsByKeypair(
    id: string,
    searchParams?: {
      pagination?: EuiPaginationEvent;
      sort?: Sort[];
      filters?:Partial<{
        status: CredentialStatus
        issuanceDateRange: EuiDateRangeSelectorDates | null
        expirationDateRange: EuiDateRangeSelectorDates | null
      }> | null;
    }
  ) {
    const { pagination, sort, filters } = searchParams || {};
    const { status, issuanceDateRange, expirationDateRange } = filters || {};
    const params: CredentialsByKeyPairPagedRequest = {
      sort: sort?.map(
        (sortItem) => `${sortItem.order === 'desc' ? '-' : ''}${sortItem.sort}`
      ),
      page: pagination?.page,
      pageSize: pagination?.pageSize,
      status,
      issuanceDateFrom: issuanceDateRange?.startRange.toISOString(),
      issuanceDateTo: issuanceDateRange?.endRange.clone().add(1, 'days').toISOString(),
      expiryDateFrom: expirationDateRange?.startRange.toISOString(),
      expiryDateTo: expirationDateRange?.endRange.clone().add(1, 'days').toISOString(),
    };
    return this._credentialsServiceV2.getCredentialsByKeypair(id, params).pipe(
      catchError((err) => {
        this.openGrowl(
          'agentConfiguration.credentialsDetail.getCredentialsDetailError',
          'danger'
        );
        throw err;
      })
    );
  }

  installCredential(credential: string, reason: string): Observable<HttpEvent<number>> {
    return this._credentialsServiceV2.uploadCredential({content: credential, reason}).pipe(
      catchError((err) => {
        this.openGrowl(
          'agentConfiguration.credentialsDetail.credentialInstallError',
          'danger'
        );
        throw err;
      }),
      tap(() => {
        this.openGrowl('agentConfiguration.credentialsDetail.credentialInstallSuccess');
      })
    );
  }
}
