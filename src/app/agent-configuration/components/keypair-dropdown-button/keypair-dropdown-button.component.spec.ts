import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeypairDropdownButtonComponent } from './keypair-dropdown-button.component';
import { TranslateModule } from '@ngx-translate/core';

describe('KeypairDropdownButtonComponent', () => {
  let component: KeypairDropdownButtonComponent;
  let fixture: ComponentFixture<KeypairDropdownButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeypairDropdownButtonComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(KeypairDropdownButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
