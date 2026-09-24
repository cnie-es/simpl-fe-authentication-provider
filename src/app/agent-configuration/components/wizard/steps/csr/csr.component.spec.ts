import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CsrComponent } from './csr.component';
import { TranslateModule } from '@ngx-translate/core';
import { AgentConfigurationService } from '../../../../agent-configuration.service';
import { EuiAppShellService } from '@eui/core';
import { TranslocoTestingModule } from '@jsverse/transloco';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  signal,
} from '@angular/core';
import { CredentialsTableComponent } from '../../../credentials-table/credentials-table.component';
import en from "../../../../../../assets/i18n/en.json";

describe('CsrComponent', () => {
  let component: CsrComponent;
  let fixture: ComponentFixture<CsrComponent>;
  let agentConfigurationServiceMock: jest.Mocked<AgentConfigurationService>;

  beforeEach(async () => {
    agentConfigurationServiceMock = {
      getKeyPairs: jest.fn() as any,
      csrFiltersChips: signal([]),
    } as unknown as jest.Mocked<AgentConfigurationService>;

    await TestBed.configureTestingModule({
      imports: [
        CsrComponent,
        TranslateModule.forRoot(),
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
        {
          provide: AgentConfigurationService,
          useValue: agentConfigurationServiceMock,
        },
        { provide: EuiAppShellService, useValue: {} },
      ],
    })
      .overrideComponent(CsrComponent, {
        remove: {
          imports: [CredentialsTableComponent],
        },
        add: {
          schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CsrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selectedKeypairId when onCsrExport is called', () => {
    const keypairId = '1234';
    component.onCsrExport(keypairId);
    expect(component.selectedKeypairId()).toBe(keypairId);
  });

  it('should compute isDialogExportCsrOpen correctly based on selectedKeypairId', () => {
    component.selectedKeypairId.set('1234');
    expect(component.isDialogExportCsrOpen()).toBe(true);
    component.selectedKeypairId.set(null);
    expect(component.isDialogExportCsrOpen()).toBe(false);
  });

  it('should reset selectedKeypairId and emit csrGenerated when onDialogClose is called with role confirm', () => {
    jest.spyOn(component.csrGenerated, 'emit');
    component.onCsrExport('1234');
    component.onDialogClose({ role: 'confirm' });
    expect(component.selectedKeypairId()).toBeNull();
    expect(component.csrGenerated.emit).toHaveBeenCalled();
  });

  it('should reset selectedKeypairId and not emit csrGenerated when onDialogClose is called with role cancel', () => {
    jest.spyOn(component.csrGenerated, 'emit');
    component.onCsrExport('1234');
    component.onDialogClose({ role: 'cancel' });
    expect(component.selectedKeypairId()).toBeNull();
    expect(component.csrGenerated.emit).not.toHaveBeenCalled();
  });
});
