import {TestBed} from '@angular/core/testing';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {AgentConfigurationService} from './agent-configuration.service';
import {HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';
import {CertificateSignRequestsService, CredentialsService} from '@simpl/api-client-authenticationprovider-v1';
import {lastValueFrom, of, throwError} from 'rxjs';
import {EuiAppShellService} from '@eui/core';
import {TranslateModule} from '@ngx-translate/core';
import {
    CredentialsService as CredentialsServiceV2,
    CsrRequest,
    KeyPairRequest,
    KeypairsService
} from '@simpl/api-client-authenticationprovider-tier1-v2';
import {mockedKeyPairsAlgorithm, mockedKeyPairsResponse} from './mocks/data';
import {Sort} from '@eui/components/eui-table-v2';
import {DateAdapter} from '@angular/material/core';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {FormControl, FormGroup} from '@angular/forms';
import moment from 'moment-timezone';
import {EuiPaginationEvent} from '@eui/components/eui-paginator';
import en from "../../assets/i18n/en.json"

const agentConfigurationServiceMock: jest.Mocked<
  Partial<AgentConfigurationService>
> = {
  getActiveKeypair: () => of(true),
  getKeyPairs: jest.fn().mockReturnValue(of({})),
  csrFiltersForm: new FormGroup({
    active: new FormControl(''),
    name: new FormControl(''),
    dateRange: new FormControl({
      value: {
        startRange: null,
        endRange: null,
      },
      disabled: false,
    }),
  }),
  searchKeyPairs: jest.fn(),
  resetFilters: jest.fn(),
  updateChips: jest.fn(),
}  as any;

describe('AgentConfigurationService', () => {

  let service: AgentConfigurationService;
  let keypairsServiceMock: any;
  let euiAppShellServiceMock: any;
  let credentialsServiceMock: any;
  let credentialsServiceV2Mock: any;
  let mockDateAdapter: any;

  beforeEach(() => {
    // Mock FileReader per i test
    (global as any).FileReader = jest.fn(() => ({
      readAsText: jest.fn(function () {
        setTimeout(() => {
          this.result = 'mock file content';
          if (typeof this.onload === 'function') this.onload();
        }, 0);
      }),
      onload: null,
      onerror: null,
      result: null,
    }));

    mockDateAdapter = {
      deserialize: jest.fn().mockImplementation((value) => value),
      compareDate: jest.fn().mockImplementation((date1, date2) => {
        if (!date1 || !date2) return 0;
        if (date1 > date2) return 1;
        if (date1 < date2) return -1;
        return 0;
      }),
      format: jest.fn().mockImplementation((date) => '01/01/2023'),
      parse: jest.fn(),
      getValidDateOrNull: jest.fn(),
    };

    euiAppShellServiceMock = {
      isBlockDocumentActive: false,
    };

    keypairsServiceMock = {
      isActiveKeyPairPresent: jest.fn().mockReturnValue(of(true)),
      getAgentEncryptionAlgorithm: jest
        .fn()
        .mockReturnValue(of(mockedKeyPairsAlgorithm)),
      listKeypairs: jest.fn().mockReturnValue(of(mockedKeyPairsResponse)),
      importKeyPair: jest.fn(),
      createKeypair: jest.fn(),
      generateCSRByKeyPair: jest.fn(),
      getKeypair: jest.fn(),
    };

    const certificateSignRequestsServiceMock = {
      generateCSR: jest.fn(),
    };

    credentialsServiceMock = {
      uploadCredential: jest.fn(),
      installCredential: jest.fn(),
      getCredential: jest.fn().mockReturnValue(of({
        "publicKey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAErUARKgMASYcIVOFMjAsDBZS75264ZrKabP1KpCnCNWSFY/PsrNZi/kZzq9WOyxLChMIJwZcprJiuGxbhiplDSw==",
        "credentialId": "z9pzxzKAjZAE2yMWf5Vptfo3xhiQgFjBFpgixhdNHSXMoU85MFK7qo6trqYudLQNQM",
        "participantId": "01985ba8-fecd-7ac9-9a3f-3afbc53637b9",
        "expiryDate": "2027-07-29T13:57:44Z"
      })),
    };
    credentialsServiceV2Mock = {
      getCredentialsByKeypair: jest.fn(),
      uploadCredential: jest.fn(),
      downloadActiveCredential: jest.fn(),
      requestCredentialsRenewal: jest.fn(),
      installCredential: jest.fn()
    };

    credentialsServiceV2Mock.downloadActiveCredential.mockReturnValue(of({
      publicKey: 'initialPubKey',
      credentialId: 'initialCredId',
      participantId: 'initialPartId',
      expiryDate: '2027-07-29T13:57:44Z'
    }));

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({}),
        TranslocoTestingModule.forRoot(
          {
            translocoConfig: {
              availableLangs: ["en"],
              defaultLang: "en",
            },
            langs: {
              en: en
            }
          }
        ),
      ],
      providers: [
        provideHttpClientTesting(),
        AgentConfigurationService,
        {
          provide: CertificateSignRequestsService,
          useValue: certificateSignRequestsServiceMock,
        },
        { provide: CredentialsService, useValue: credentialsServiceMock },
        { provide: CredentialsServiceV2, useValue: credentialsServiceV2Mock },
        { provide: EuiAppShellService, useValue: euiAppShellServiceMock },
        { provide: KeypairsService, useValue: keypairsServiceMock },
        { provide: DateAdapter, useValue: mockDateAdapter },
      ],
    });
    jest.clearAllMocks();
  });

  it('should be created', () => {
    service = TestBed.inject(AgentConfigurationService);
    expect(service).toBeTruthy();
  });

  describe('hasActiveKeypair', () => {
    it('should return true when status is 204', (done) => {
      const mockResponse = new HttpResponse({ status: 204 });
      keypairsServiceMock.isActiveKeyPairPresent.mockReturnValue(
        of(mockResponse)
      );
      service = TestBed.inject(AgentConfigurationService);
      service.getActiveKeypair().subscribe((result) => {
        expect(result).toBe(true);
        expect(keypairsServiceMock.isActiveKeyPairPresent).toHaveBeenCalledWith(
          'response'
        );
        done();
      });
    });

    it('should return false when status is 404', (done) => {
      const mockError = new HttpErrorResponse({ status: 404 });
      const keypairSpy = jest
        .spyOn(keypairsServiceMock, 'isActiveKeyPairPresent')
        .mockReturnValue(throwError(() => mockError));

      service = TestBed.inject(AgentConfigurationService);
      service.getActiveKeypair().subscribe((result) => {
        expect(result).toBe(false);
        expect(keypairSpy).toHaveBeenCalledWith('response');
        done();
      });
    });

    it('should throw error if status is neither 204 or 404', (done) => {
      const mockError = new HttpErrorResponse({ status: 500 });
      const keypairSpy = jest
        .spyOn(keypairsServiceMock, 'isActiveKeyPairPresent')
        .mockReturnValue(throwError(() => mockError));

      service = TestBed.inject(AgentConfigurationService);
      service.getActiveKeypair().subscribe({
        error: (error) => {
          expect(error).toBe(mockError);
          expect(keypairSpy).toHaveBeenCalledWith('response');
          done();
        },
      });
    });
  });

  describe('getKeyPairs', () => {
    it('should return key pairs on success', (done) => {
      service = TestBed.inject(AgentConfigurationService);
      service.getKeyPairs().subscribe((keyPairs) => {
        expect(keyPairs).toEqual(mockedKeyPairsResponse);
        done();
      });
    });
  });

  describe('getKeypairsAlgorithm', () => {
    it('should return the keypairs algorithm successfully', (done) => {
      service = TestBed.inject(AgentConfigurationService);
      const mockAlgorithmResponse = mockedKeyPairsAlgorithm;

      keypairsServiceMock.getAgentEncryptionAlgorithm.mockReturnValue(
        of(mockAlgorithmResponse) as any
      );

      service.getKeypairsAlgorithm().subscribe((algorithm) => {
        expect(algorithm).toEqual(mockAlgorithmResponse);
        done();
      });
    });

    it('should finalize and set isBlockDocumentActive to false after completion', (done) => {
      service = TestBed.inject(AgentConfigurationService);
      keypairsServiceMock.getAgentEncryptionAlgorithm.mockReturnValue(
        of(mockedKeyPairsAlgorithm) as any
      );

      service.getKeypairsAlgorithm().subscribe(() => {
        expect(euiAppShellServiceMock.isBlockDocumentActive).toBe(false);
        done();
      });
    });
  });

  describe('importKeyPair', () => {
    it('should call credentialsService.uploadCredential with file content', async () => {
      service = TestBed.inject(AgentConfigurationService);
      const mockFile = new File(['test'], 'test.pem', {
        type: 'application/x-pem-file',
      });
      const mockHttpEvent = new HttpResponse({ status: 200, body: 100 });
      credentialsServiceV2Mock.uploadCredential.mockReturnValue(of(mockHttpEvent));
      await lastValueFrom(service.uploadCredentials(mockFile,'test'));
      expect(credentialsServiceV2Mock.uploadCredential).toHaveBeenCalledWith(
        { content: 'mock file content', reason: 'test' },
        'events',
        true
      );
    });
  });

  describe('generateKeypairV2', () => {
    const mockKeypairRequest: KeyPairRequest = { name: 'Keypair1' };

    it('should successfully generate a keypair and show success growl', (done) => {
      service = TestBed.inject(AgentConfigurationService);
      const createKeypairSpy = jest
        .spyOn(keypairsServiceMock, 'createKeypair')
        .mockReturnValue(of({}) as any);
      const growlSpy = jest.spyOn(service['growlService'], 'growl');

      service.generateKeypairV2(mockKeypairRequest).subscribe(() => {
        expect(createKeypairSpy).toHaveBeenCalledWith(mockKeypairRequest);
        expect(growlSpy).toHaveBeenCalledWith(
          {
            severity: 'success',
            summary: 'common.actionCompleted',
            detail: 'agentConfiguration.keypairGeneration.success',
            life: 5000,
            sticky: undefined,
          },
          false,
          false,
          5000
        );
        done();
      });
    });

    it('should handle error and show danger growl', (done) => {
      service = TestBed.inject(AgentConfigurationService);
      const mockError = new Error('Keypair generation failed');
      const createKeypairSpy = jest
        .spyOn(keypairsServiceMock, 'createKeypair')
        .mockReturnValue(throwError(() => mockError));
      const growlSpy = jest.spyOn(service['growlService'], 'growl');

      service.generateKeypairV2(mockKeypairRequest).subscribe({
        error: (error) => {
          expect(createKeypairSpy).toHaveBeenCalledWith(mockKeypairRequest);
          expect(growlSpy).toHaveBeenCalledWith(
            {
              severity: 'danger',
              summary: 'common.actionFailed',
              detail: 'agentConfiguration.keypairGeneration.error',
              life: 5000,
              sticky: undefined,
            },
            false,
            false,
            5000
          );
          expect(error).toBe(mockError);
          done();
        },
      });
    });
  });

  describe('uploadCredentials', () => {
    it('should call credentialsServiceV2.uploadCredential with file content', async () => {
      service = TestBed.inject(AgentConfigurationService);
      const mockFile = new File(['test'], 'test.pem', {
        type: 'application/x-pem-file',
      });
      const mockHttpEvent = new HttpResponse({ status: 200, body: 100 });
      credentialsServiceV2Mock.uploadCredential.mockReturnValue(of(mockHttpEvent));
      await lastValueFrom(service.uploadCredentials(mockFile, 'test'));
      expect(credentialsServiceV2Mock.uploadCredential).toHaveBeenCalledWith(
        { content: 'mock file content', reason: 'test' },
        'events',
        true
      );
    });

    it('should call openGrowl with error and propagate error if uploadCredential fails', (done) => {
      service = TestBed.inject(AgentConfigurationService);
      const mockFile = new File(['test'], 'test.pem', {
        type: 'application/x-pem-file',
      });
      const mockError = new Error('upload failed');
      credentialsServiceV2Mock.uploadCredential.mockReturnValue(throwError(() => mockError));
      const growlSpy = jest.spyOn(service, 'openGrowl');

      service.uploadCredentials(mockFile, 'test').subscribe({
        next: () => {
          // Non dovrebbe mai essere chiamato
          fail('Should not emit next on error');
        },
        error: (err) => {
          expect(growlSpy).toHaveBeenCalledWith('agentConfiguration.credentialsImport.error', 'danger');
          expect(err).toBe(mockError);
          done();
        },
        complete: () => {
          // Non dovrebbe mai essere chiamato
          fail('Should not complete on error');
        }
      });
    });
  });

  describe('extractFileName', () => {
    it('should extract filename from Content-Disposition header', (done) => {
      service = TestBed.inject(AgentConfigurationService);
      const result = service['extractFileName'](
        'attachment; filename="test.pem"'
      );
      expect(result).toBe('test.pem');
      done();
    });

    it('should return default filename when header is null', (done) => {
      service = TestBed.inject(AgentConfigurationService);
      const result = service['extractFileName'](null);
      expect(result).toBe('csr.pem');
      done();
    });

    it('should return default filename when filename is not in header', (done) => {
      service = TestBed.inject(AgentConfigurationService);
      const result = service['extractFileName']('attachment');
      expect(result).toBe('csr.pem');
      done();
    });
  });

  describe('importKeyPairV2', () => {
    const mockKeyPairImportRequest = {
      name: 'Test Keypair',
      publicKey: 'mock-public-key',
      privateKey: 'mock-private-key',
    };

    it('should successfully import a key pair and show a success growl', (done) => {
      service = TestBed.inject(AgentConfigurationService);
      keypairsServiceMock.importKeyPair.mockReturnValue(of({}) as any);
      const growlSpy = jest.spyOn(service['growlService'], 'growl');

      service.importKeyPairV2(mockKeyPairImportRequest).subscribe(() => {
        expect(keypairsServiceMock.importKeyPair).toHaveBeenCalledWith(
          mockKeyPairImportRequest
        );
        expect(growlSpy).toHaveBeenCalledWith(
          {
            severity: 'success',
            summary: 'common.actionCompleted',
            detail: 'agentConfiguration.importKeypair.success',
            life: 5000,
            sticky: undefined,
          },
          false,
          false,
          5000
        );
        done();
      });
    });

    it('should handle errors and show a danger growl', (done) => {
      service = TestBed.inject(AgentConfigurationService);
      const mockError = new Error('Import key pair failed');
      keypairsServiceMock.importKeyPair.mockReturnValue(
        throwError(() => mockError)
      );
      const growlSpy = jest.spyOn(service['growlService'], 'growl');

      service.importKeyPairV2(mockKeyPairImportRequest).subscribe({
        error: (error) => {
          expect(keypairsServiceMock.importKeyPair).toHaveBeenCalledWith(
            mockKeyPairImportRequest
          );
          expect(growlSpy).toHaveBeenCalledWith(
            {
              severity: 'danger',
              summary: 'common.actionFailed',
              detail: 'agentConfiguration.importKeypair.error',
              life: 5000,
              sticky: undefined,
            },
            false,
            false,
            5000
          );
          expect(error).toBe(mockError);
          done();
        },
      });
    });
  });

    describe('getKeypairDetails', () => {
        it('should fetch keypair details successfully for a valid id', (done) => {
            const mockKeypairId = '12345';
            const mockKeypairDetails = {id: '12345', name: 'Test Keypair'};

            service = TestBed.inject(AgentConfigurationService);
            keypairsServiceMock.getKeypair.mockReturnValue(of(mockKeypairDetails));

            service.getKeypairDetails(mockKeypairId).subscribe((result) => {
                expect(result).toEqual(mockKeypairDetails);
                expect(keypairsServiceMock.getKeypair).toHaveBeenCalledWith(mockKeypairId);
                done();
            });
        });

        it('should handle errors correctly when fetching keypair details fails', (done) => {
            const mockKeypairId = '12345';
            const mockError = new HttpErrorResponse({status: 500});

            service = TestBed.inject(AgentConfigurationService);
            keypairsServiceMock.getKeypair.mockReturnValue(throwError(() => mockError));
            const growlSpy = jest.spyOn(service['growlService'], 'growl');

            service.getKeypairDetails(mockKeypairId).subscribe({
                error: (error) => {
                    expect(error).toBe(mockError);
                    expect(keypairsServiceMock.getKeypair).toHaveBeenCalledWith(mockKeypairId);
                    expect(growlSpy).toHaveBeenCalled();
                    done();
                },
            });
        });

        it('should handle errors correctly when fetching keypair details fails', (done) => {
            const mockKeypairId = '12345';
            const mockError = new HttpErrorResponse({status: 404, statusText: 'Not Found'});
            service = TestBed.inject(AgentConfigurationService);
            keypairsServiceMock.getKeypair.mockReturnValue(throwError(() => mockError));
            const navigateSpy = jest.spyOn(service['router'], 'navigate');

          service.getKeypairDetails(mockKeypairId).subscribe({
            error: (error) => {
              expect(error).toBe(mockError);
              expect(keypairsServiceMock.getKeypair).toHaveBeenCalledWith(mockKeypairId);
              expect(navigateSpy).toHaveBeenCalled();
              done();
            },
          });
        })
    });

    describe('searchKeyPairs', () => {
    it('should call listKeypairs with correct filters when searchParams are provided', (done) => {
      service = TestBed.inject(AgentConfigurationService);

      const mockPagination = { page: 1, pageSize: 10, nbPage: 5 };
      const mockSort = [{ sort: 'name', order: 'asc' }];
      const expectedFilters = {
        sort: ['name'],
        page: mockPagination.page,
        pageSize: mockPagination.pageSize,
        name: null,
        active: null,
        creationTimestampFrom: undefined,
        creationTimestampTo: undefined,
      };

      keypairsServiceMock.listKeypairs.mockReturnValue(of([] as any));
      service.searchKeyPairs({
        pagination: mockPagination,
        sort: mockSort as Sort[],
      });

      service.getKeyPairs().subscribe(() => {
        expect(keypairsServiceMock.listKeypairs).toHaveBeenCalledWith(
          expectedFilters
        );
        done();
      });
    });

    it('should call listKeypairs with default filters when searchParams are not provided', (done) => {
      service = TestBed.inject(AgentConfigurationService);
      const expectedFilters = {
        sort: undefined,
        page: undefined,
        pageSize: undefined,
        name: null,
        active: null,
        creationTimestampFrom: undefined,
        creationTimestampTo: undefined,
      };
        keypairsServiceMock.listKeypairs.mockReturnValue(of([] as any));

      service.searchKeyPairs();

      service.getKeyPairs().subscribe(() => {
        expect(keypairsServiceMock.listKeypairs).toHaveBeenCalledWith(
          expectedFilters
        );
        done();
      });
    });

    it('should finalize and set isBlockDocumentActive to false after execution', (done) => {
      service = TestBed.inject(AgentConfigurationService);
      keypairsServiceMock.listKeypairs.mockReturnValue(of([] as any));

      service.searchKeyPairs();
      service.getKeyPairs().subscribe({
        complete: () => {
          expect(euiAppShellServiceMock.isBlockDocumentActive).toBe(false);
          done();
        },
      });
    });
  });

  describe('generateCsr', () => {
    let createObjectURLMock: jest.SpyInstance;
    let revokeObjectURLMock: jest.SpyInstance;
    let createElementMock: jest.SpyInstance;

    beforeEach(() => {
      global.URL.createObjectURL = jest.fn();
      global.URL.revokeObjectURL = jest.fn();
      const createObjectURLSpy = jest.spyOn(
        global.window.URL,
        'createObjectURL'
      );
      const revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL');
      createObjectURLMock = createObjectURLSpy.mockReturnValue('mock-url');
      revokeObjectURLMock = revokeObjectURLSpy.mockImplementation();
      createElementMock = jest
        .spyOn(document, 'createElement')
        .mockImplementation((tag) => {
          return {
            click: jest.fn(),
          } as unknown as HTMLElement;
        });
    });

    afterEach(() => {
      createObjectURLMock.mockRestore();
      revokeObjectURLMock.mockRestore();
      createElementMock.mockRestore();
    });

    it('should generate a CSR and return the file with correct filename', (done) => {
      service = TestBed.inject(AgentConfigurationService);

      const keyPairId = '12345';
      const csrDetails: CsrRequest = {
        commonName: 'testCN',
        organization: '',
        organizationalUnit: '',
        country: '',
      };
      const mockResponse = new HttpResponse({
        body: { csr : 'testCSR'},
        headers: new HttpHeaders({
          'Content-Disposition': 'attachment; filename="generated.csr"',
        }),
        status: 200,
      });

      keypairsServiceMock.generateCSRByKeyPair.mockReturnValue(
        of(mockResponse)
      );

      service.generateCsr(keyPairId, csrDetails).subscribe((result) => {
        expect(result.body!.csr).toEqual(mockResponse.body!.csr);
        expect(keypairsServiceMock.generateCSRByKeyPair).toHaveBeenCalledWith(
          keyPairId,
          csrDetails,
          'response'
        );
        done();
      });
    });

    it('should return default filename when Content-Disposition header is missing', (done) => {
      service = TestBed.inject(AgentConfigurationService);

      const keyPairId = 'keypair123';
      const csrDetails = {
        commonName: 'testCN',
        organization: '',
        organizationalUnit: '',
        country: '',
      };
      const mockResponse = new HttpResponse({
        body: new Blob(['testCSR']),
        status: 200,
      });

      keypairsServiceMock.generateCSRByKeyPair.mockReturnValue(
        of(mockResponse)
      );

      service.generateCsr(keyPairId, csrDetails).subscribe((result) => {
        done();
      });
    });

    it('should throw an error when the server returns an error', (done) => {
      service = TestBed.inject(AgentConfigurationService);

      const mockError = new HttpErrorResponse({ status: 500 });

      keypairsServiceMock.generateCSRByKeyPair.mockReturnValue(
        throwError(() => mockError)
      );

      service
        .generateCsr('keypair123', {
          commonName: 'testCN',
          organization: '',
          organizationalUnit: '',
          country: '',
        })
        .subscribe({
          error: (error) => {
            expect(error).toBe(mockError);
            done();
          },
        });
    });
  });

  describe('resetFilters', () => {
    it('should reset the filters form to default values', () => {
      service = TestBed.inject(AgentConfigurationService);
      service.csrFiltersForm.setValue({
        active: 'true',
        name: 'testName',
        dateRange: {
          startRange: new Date(),
          endRange: new Date(),
        },
      });

      service.resetFilters();

      expect(service.csrFiltersForm.value).toEqual({
        active: '',
        name: '',
        dateRange: {
          startRange: null,
          endRange: null,
        },
      });
    });

    it('should update the validity of the filters form after reset', () => {
      service = TestBed.inject(AgentConfigurationService);
      const updateValiditySpy = jest.spyOn(
        service.csrFiltersForm,
        'updateValueAndValidity'
      );

      service.resetFilters();

      expect(updateValiditySpy).toHaveBeenCalled();
    });
  });

  describe('updateChips', () => {
    let service: AgentConfigurationService;

    beforeEach(() => {
      service = TestBed.inject(AgentConfigurationService);
    });

    it('should generate correct chips for dateRange field', () => {
      service.csrFiltersForm.setValue({
        active: '',
        name: '',
        dateRange: {
          startRange: moment('2025-01-01'),
          endRange: moment('2025-01-31')
        }
      });

      service.updateChips();

      expect(service.csrFiltersChips()).toEqual([
        { field: 'updateTimestampFrom', value: '01/01/2025' },
        { field: 'updateTimestampTo', value: '31/01/2025' }
      ]);
    });

    it('should generate correct chips for fields other than dateRange', () => {
      service.csrFiltersForm.setValue({
        active: 'true',
        name: 'Test Name',
        dateRange: {
          startRange: null,
          endRange: null
        }
      });

      service.updateChips();

      expect(service.csrFiltersChips()).toEqual([
        { field: 'active', value: 'true' },
        { field: 'name', value: 'Test Name' }
      ]);
    });

    it('should not generate chips if all form values are empty', () => {
      service.csrFiltersForm.setValue({
        active: '',
        name: '',
        dateRange: {
          startRange: null,
          endRange: null
        }
      });

      service.updateChips();

      expect(service.csrFiltersChips()).toEqual([]);
    });
  });

  describe('setActiveKeyPair', () => {
    let service: AgentConfigurationService;

    beforeEach(() => {
      service = TestBed.inject(AgentConfigurationService);
    });

    it('should return true when status is 204', (done) => {
      const mockResponse = new HttpResponse({status: 204});
      jest.spyOn(keypairsServiceMock, 'isActiveKeyPairPresent').mockReturnValue(of(mockResponse));

      service.setActiveKeyPair();

      service.getActiveKeypair().subscribe((result) => {
        expect(result).toBe(true);
        expect(keypairsServiceMock.isActiveKeyPairPresent).toHaveBeenCalledWith('response');
        done();
      });
    });

    it('should return false when status is 404', (done) => {
      const mockError = new HttpErrorResponse({status: 404});
      jest.spyOn(keypairsServiceMock, 'isActiveKeyPairPresent').mockReturnValue(throwError(() => mockError));

      service.setActiveKeyPair();

      service.getActiveKeypair().subscribe((result) => {
        expect(result).toBe(false);
        expect(keypairsServiceMock.isActiveKeyPairPresent).toHaveBeenCalledWith('response');
        done();
      });
    });

    it('should throw an error when the status is neither 204 nor 404', (done) => {
      const mockError = new HttpErrorResponse({status: 500});
      jest.spyOn(keypairsServiceMock, 'isActiveKeyPairPresent').mockReturnValue(throwError(() => mockError));

      service.setActiveKeyPair();

      service.getActiveKeypair().subscribe({
        error: (error) => {
          expect(error).toBe(mockError);
          expect(keypairsServiceMock.isActiveKeyPairPresent).toHaveBeenCalledWith('response');
          done();
        },
      });
    });
  });

  describe('getCredentialsByKeypair', () => {
    it('should fetch credentials successfully', (done) => {
      service = TestBed.inject(AgentConfigurationService);
      const mockKeypairId = '12345';
      const mockPagination = {page: 1, pageSize: 10};
      const mockSort = [{sort: 'name', order: 'asc'}];
      const mockResponse = {data: [{id: '1', name: 'Credential1'}]};

      credentialsServiceV2Mock.getCredentialsByKeypair.mockReturnValue(of(mockResponse));

      service.getCredentialsByKeypair(mockKeypairId, {
        pagination: mockPagination as EuiPaginationEvent,
        sort: mockSort as Sort[]
      }).subscribe((result) => {
        expect(result).toEqual(mockResponse);
        expect(credentialsServiceV2Mock.getCredentialsByKeypair).toHaveBeenCalledWith(mockKeypairId, {
          sort: ['name'],
          page: mockPagination.page,
          pageSize: mockPagination.pageSize,
        });
        done();
      });
    });

    it('should show a danger growl when an error occurs', (done) => {
      service = TestBed.inject(AgentConfigurationService);
      const mockKeypairId = '12345';
      const mockError = new HttpErrorResponse({status: 500});
      const growlSpy = jest.spyOn(service['growlService'], 'growl');

      credentialsServiceV2Mock.getCredentialsByKeypair.mockReturnValue(throwError(() => mockError));

      service.getCredentialsByKeypair(mockKeypairId).subscribe({
        error: (error) => {
          expect(error).toBe(mockError);
          expect(credentialsServiceV2Mock.getCredentialsByKeypair).toHaveBeenCalledWith(mockKeypairId, { page: undefined, pageSize: undefined, sort: undefined });
          expect(growlSpy).toHaveBeenCalled();
          done();
        },
      });
    });
  });

  describe('activeCredential', () => {
    it('should retrieve the active credential from CredentialsServiceV2', (done) => {
      const service = TestBed.inject(AgentConfigurationService);
      service.activeCredential$.subscribe({
        next: (credential) => {
          expect(credential).toEqual({
            publicKey: 'initialPubKey',
            credentialId: 'initialCredId',
            participantId: 'initialPartId',
            expiryDate: '2027-07-29T13:57:44Z'
          });
          done();
        }
      });
    });

    it('should return null if API returns 404', (done) => {
      credentialsServiceV2Mock.downloadActiveCredential.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 404 }))
      );
      const service = TestBed.inject(AgentConfigurationService);
      service.setActiveCredential();
      service.activeCredential$.subscribe({
        next: (credential) => {
          expect(credential).toBeNull();
          done();
        }
      });
    });

    it('should throw error if API returns 500', (done) => {
      const errorResp = new HttpErrorResponse({ status: 500 });
      credentialsServiceV2Mock.downloadActiveCredential.mockReturnValue(
        throwError(() => errorResp)
      );
      const service = TestBed.inject(AgentConfigurationService);
      service.setActiveCredential();
      service.activeCredential$.subscribe({
        error: (error) => {
          expect(error).toBe(errorResp);
          done();
        }
      });
    });

    it('should update activeCredential$ after setActiveCredential() with new value', (done) => {
      const newCredential = {
        publicKey: 'newPubKey',
        credentialId: 'newCredId',
        participantId: 'newPartId',
        expiryDate: '2028-07-29T13:57:44Z'
      };
      credentialsServiceV2Mock.downloadActiveCredential.mockReturnValue(of(newCredential));
      const service = TestBed.inject(AgentConfigurationService);
      service.setActiveCredential();
      service.activeCredential$.subscribe({
        next: (credential) => {
          expect(credential).toEqual(newCredential);
          done();
        }
      });
    });
  });



  describe('installCredential', () => {
    let testCredential: string;

    beforeEach(() => {
      service = TestBed.inject(AgentConfigurationService);
      testCredential = 'mock test credential';
    });

    it('should successfully install a credential and show a success growl', (done) => {
      const mockHttpResponse = new HttpResponse({status: 200});
      jest.spyOn(service['growlService'], 'growl');
      // Use V2 service mock (the service implementation calls _credentialsServiceV2)
      credentialsServiceV2Mock.uploadCredential.mockReturnValue(of(mockHttpResponse));

      service.installCredential(testCredential, 'reason').subscribe(() => {
        expect(credentialsServiceV2Mock.uploadCredential).toHaveBeenCalledWith({ content: testCredential, reason: 'reason' });
        expect(service['growlService'].growl).toHaveBeenCalledWith(
          {
            severity: 'success',
            summary: 'common.actionCompleted',
            detail: 'agentConfiguration.credentialsDetail.credentialInstallSuccess',
            life: 5000,
            sticky: undefined,
          },
          false,
          false,
          5000
        );
        done();
      });
    });

    it('should handle errors and show a danger growl', (done) => {
      const mockError = new HttpErrorResponse({status: 500});
      const growlSpy = jest.spyOn(service['growlService'], 'growl');
      credentialsServiceV2Mock.uploadCredential.mockReturnValue(throwError(() => mockError));

      service.installCredential(testCredential, 'reason').subscribe({
        error: (error) => {
          expect(credentialsServiceV2Mock.uploadCredential).toHaveBeenCalledWith({ content: testCredential, reason: 'reason' });
          expect(growlSpy).toHaveBeenCalledWith(
            {
              severity: 'danger',
              summary: 'common.actionFailed',
              detail: 'agentConfiguration.credentialsDetail.credentialInstallError',
              life: 5000,
              sticky: undefined,
            },
            false,
            false,
            5000
          );
          expect(error).toBe(mockError);
          done();
        },
      });
    });
  });
});
