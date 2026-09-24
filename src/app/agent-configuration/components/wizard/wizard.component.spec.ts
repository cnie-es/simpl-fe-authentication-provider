import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WizardComponent } from './wizard.component';
import { TranslateModule } from '@ngx-translate/core';
import { EuiWizardStep } from '@eui/components/eui-wizard';
import { WizardService } from './wizard.service';
import { signal } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AgentConfigurationService } from '../../agent-configuration.service';
import { EuiAppShellService } from '@eui/core';
import { of } from 'rxjs';
import { mockedKeyPairsResponse } from '../../mocks/data';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;
  const wizardServiceMock: jest.Mocked<WizardService> = {
    activeStepIndex: signal(0),
    getActiveWizardStepIndex: jest.fn().mockReturnValue(of(2))
  } as any
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClientTesting(),
        {
          provide: WizardService, useValue: wizardServiceMock
        },
        {
          provide: AgentConfigurationService, useValue: {
            getKeyPairs: jest.fn().mockReturnValue(of(mockedKeyPairsResponse))
          } },
        { provide: EuiAppShellService, useValue: {} },
      ]

    }).compileComponents();

    fixture = TestBed.createComponent(WizardComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark the current step as completed and move to the next step when onCsrGenerated is called', () => {
    component.wizardService.activeStepIndex.set(2);
    const mockWizardStep = [
      { isCompleted: false,
      isDisabled: false },
      { isCompleted: false,
      isDisabled: false },
      { isCompleted: false,
        isDisabled: true },
    ] as any;

    jest.spyOn(component, 'wizardSteps').mockImplementation(() => mockWizardStep);
    component.onCsrGenerated();

    expect(mockWizardStep[1].isCompleted).toBe(true);
    expect(component.wizardService.activeStepIndex()).toBe(3);
  });

  it('should mark the current step as completed when onKeyPairGenerated is called', () => {
    component.wizardService.activeStepIndex.set(1);
    const mockWizardStep = [
      { isCompleted: false, isDisabled: false },
      { isCompleted: false, isDisabled: true }
    ] as any;

    jest.spyOn(component, 'wizardSteps').mockImplementation(() => mockWizardStep);
    component.onKeyPairGenerated();

    expect(mockWizardStep[0].isCompleted).toBe(true);
  });

  it('should enable the next step if it is disabled when onKeyPairGenerated is called', () => {
    component.wizardService.activeStepIndex.set(1);
    const mockWizardStep = [
      { isCompleted: false, isDisabled: false },
      { isCompleted: false, isDisabled: true }
    ] as any;

    jest.spyOn(component, 'wizardSteps').mockImplementation(() => mockWizardStep);
    component.onKeyPairGenerated();

    expect(mockWizardStep[1].isDisabled).toBe(false);
  });

  it('should increment the active step index when onKeyPairGenerated is called', () => {
    component.wizardService.activeStepIndex.set(1);
    const mockWizardStep = [
      { isCompleted: false, isDisabled: false },
      { isCompleted: false, isDisabled: true }
    ] as any;

    jest.spyOn(component, 'wizardSteps').mockImplementation(() => mockWizardStep);
    component.onKeyPairGenerated();

    expect(component.wizardService.activeStepIndex()).toBe(2);
  });

  it('should set activeStepIndex to the event index when onSelectStep is called', (done) => {
    component.ngAfterViewInit();
    fixture.detectChanges();
    const mockEvent: EuiWizardStep = { index: 3 } as EuiWizardStep;
    component.onSelectStep(mockEvent);
    fixture.detectChanges();
    setTimeout(() => {
      expect(component.wizardService.activeStepIndex()).toBe(3);
      done();
    }, 100)
  });

  it('should disable steps after the active step and mark previous steps as completed in ngAfterViewInit', (done) => {
    component.ngAfterViewInit();
    fixture.detectChanges();

    setTimeout(() => {
      const steps = component.wizardSteps();
      expect(steps[0].isCompleted).toBe(true);
      expect(steps[1].isCompleted).toBe(true);
      expect(steps[2].isDisabled).toBe(false);
      done();
    }, 10);
  });
});
