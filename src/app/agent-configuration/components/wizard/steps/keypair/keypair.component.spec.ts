import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeypairComponent } from './keypair.component';
import { AgentConfigurationService } from '../../../../agent-configuration.service';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { EuiAppShellService } from '@eui/core';
import { mockedKeyPairsAlgorithm } from '../../../../mocks/data';
import { HttpErrorResponse } from '@angular/common/http';

describe('KeypairComponent', () => {
  let component: KeypairComponent;
  let fixture: ComponentFixture<KeypairComponent>;
  const agentConfigurationServiceMock: any = {
    getActiveKeypair: jest.fn().mockReturnValue(of(true)),
    getKeypairsAlgorithm: jest.fn().mockReturnValue(of(mockedKeyPairsAlgorithm))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeypairComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: AgentConfigurationService,
          useValue: agentConfigurationServiceMock,
        },
        {
          provide: EuiAppShellService,
          useValue: {
            isBlockDocumentActive: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KeypairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Keypair import', () => {
    it('should open import dialog', () => {
      component.importKeypair();
      expect(component.isDialogImportOpen()).toBe(true);
    });
  });

  describe('getAlgorithmDetails', () => {
    it('should emit algorithm details successfully', (done) => {
      component.getAlgorithmDetails().subscribe((details) => {
        expect(details).toEqual(mockedKeyPairsAlgorithm);
        done();
      });
    });

    it('should handle errors by closing the dialog', (done) => {
      agentConfigurationServiceMock.getKeypairsAlgorithm.mockReturnValue(throwError(() => new HttpErrorResponse({status: 500})));
      fixture = TestBed.createComponent(KeypairComponent);
      component = fixture.componentInstance;
      component.getAlgorithmDetails().subscribe({
        error : error => {
          expect(error).toBeDefined();
          expect(component.isDialogImportOpen()).toBe(false);
          done();
        }
      });
    });
  });



  it('should open generate dialog', () => {
    component.generateNewKeypair();
    expect(component.isDialogGenerateOpen()).toBe(true);
  });

  describe('Dialog close handlers', () => {
    it('should close import dialog', () => {
      component.onDialogClose({role: 'cancel'});
      expect(component.isDialogImportOpen()).toBe(false);
    });
    it('should close generate dialog', () => {
      component.onDialogClose({role: 'cancel'});
      expect(component.isDialogGenerateOpen()).toBe(false);
    });
    it('should not emit keyPairGenerated event if role is cancel', () => {
      jest.spyOn(component.keyPairGenerated, 'emit');
      component.onDialogClose({role: 'cancel'});
      expect(component.keyPairGenerated.emit).not.toHaveBeenCalled();
    });
    it('should emit keyPairGenerated event if role is confirm', () => {
      jest.spyOn(component.keyPairGenerated, 'emit');
      component.onDialogClose({role: 'confirm'});
      expect(component.keyPairGenerated.emit).toHaveBeenCalled();
    });
  })
});
