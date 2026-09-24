import {FormControl, FormGroup, ValidationErrors} from '@angular/forms';
import {confirmPasswordValidator, detailedPasswordValidation, notEmpty, startEndDateRangeValidator,} from './index';
import moment from 'moment-timezone';

describe('confirmPasswordValidator', () => {
  it('it should return null if there are no error', () => {
    const form = new FormGroup({
      password: new FormControl('Secret123!'),
      confirmPassword: new FormControl('Secret123!'),
    });

    const result = confirmPasswordValidator(form);
    expect(result).toBeNull();
  });

  it('sets noMatch when passwords do not match and preserves existing errors', () => {
    const form = new FormGroup({
      password: new FormControl('Secret123!'),
      confirmPassword: new FormControl('Secret1234!'),
    });
    form.get('confirmPassword')!.setErrors({ required: true });

    confirmPasswordValidator(form);

    expect(form.get('confirmPassword')!.errors).toEqual({
      required: true,
      noMatch: true,
    });
  });

  it('removes only noMatch when passwords match and keeps other errors', () => {
    const form = new FormGroup({
      password: new FormControl('Secret123!'),
      confirmPassword: new FormControl('Secret123!'),
    });
    form.get('confirmPassword')!.setErrors({ noMatch: true, required: true });

    confirmPasswordValidator(form);

    expect(form.get('confirmPassword')!.errors).toEqual({ required: true });
  });

  it('clears errors when only noMatch is present and passwords match', () => {
    const form = new FormGroup({
      password: new FormControl('Secret123!'),
      confirmPassword: new FormControl('Secret123!'),
    });
    form.get('confirmPassword')!.setErrors({ noMatch: true });

    confirmPasswordValidator(form);

    expect(form.get('confirmPassword')!.errors).toBeNull();
  });

  it('does nothing when passwords match and no noMatch error exists', () => {
    const form = new FormGroup({
      password: new FormControl('Secret123!'),
      confirmPassword: new FormControl('Secret123!'),
    });
    form.get('confirmPassword')!.setErrors({ minlength: true });

    confirmPasswordValidator(form);

    expect(form.get('confirmPassword')!.errors).toEqual({ minlength: true });
  });
});


describe('detailedPasswordValidation', () => {

    const control = new FormControl('');
    const form = new FormGroup({password: control}, detailedPasswordValidation)

    beforeEach(() => {
      control.reset("");
      control.updateValueAndValidity();
    })


    it('should return no errors for a valid password', () => {
        control.setValue('Valid1@Password');
      control.updateValueAndValidity();
        expect(form.errors).toBeNull();
    });

    it('should return "minLength" error for passwords shorter than 10 characters', () => {
        control.setValue('Short1$');
        expect(form.errors).toEqual({passwordMinLength: true});
    });

    it('should return "maxLength" error for passwords longer than 64 characters', () => {
        const longPassword = 'A'.repeat(65) + '1@a';
        control.setValue(longPassword);
        expect(form.errors).toEqual({passwordMaxLength: true});
    });

    it('should return "uppercase" error when there is no uppercase letter', () => {
        control.setValue('lowercase1@');
        expect(form.errors).toEqual({passwordUppercase: true});
    });

    it('should return "lowercase" error when there is no lowercase letter', () => {
      control.setValue('UPPERCASE1@');
      expect(form.errors).toEqual({passwordLowercase: true});
    });

    it('should return "numeric" error when there is no number', () => {
        control.setValue('Password@!');
        expect(form.errors).toEqual({passwordNumeric: true});
    });

    it('should return "specialChar" error when there is no special character', () => {
      control.setValue('Password123');
      expect(form.errors).toEqual({passwordSpecialChar: true});
    });

    it('should return "forbidden" error if password contains forbidden values', () => {
        const group = new FormGroup({
            password: new FormControl(''),
            applicant: new FormGroup({
                firstName: new FormControl('Michael'),
                lastName: new FormControl('Jordan'),
                username: new FormControl('johndoe'),
                email: new FormControl('john.doe@example.com'),
            }),
            organization: new FormControl('orgXYZ'),
        }, detailedPasswordValidation);

        group.get('password')?.setValue('john12345!Jordan');
        group.get('password')?.updateValueAndValidity();

        expect(group.errors).toEqual({passwordForbidden: true});
    });
});

describe('startEndDateRangeValidator', () => {
  it('should return no errors for valid start and end dates', () => {
    const control = new FormControl({
      startRange: moment('2025-01-01'),
      endRange: moment('2025-12-31'),
    });
    const result: ValidationErrors | null = startEndDateRangeValidator(control);
    expect(result).toBeNull();
  });

  it('should return error for invalid date range (start date after end date)', () => {
    const control = new FormControl({
      startRange: moment('2025-12-31'),
      endRange: moment('2025-01-01'),
    });
    const result: ValidationErrors | null = startEndDateRangeValidator(control);
    expect(result).toEqual({dateRangeInvalid: true});
  });

  it('should return no errors when control value is null', () => {
    const control = new FormControl(null);
    const result: ValidationErrors | null = startEndDateRangeValidator(control);
    expect(result).toBeNull();
  });

  it('should return no errors when control value is not an object', () => {
    const control = new FormControl('not-an-object');
    const result: ValidationErrors | null = startEndDateRangeValidator(control);
    expect(result).toBeNull();
  });

  it('should return no errors when startRange or endRange is not a moment object', () => {
    const control = new FormControl({
      startRange: '2025-01-01',
      endRange: '2025-12-31',
    });
    const result: ValidationErrors | null = startEndDateRangeValidator(control);
    expect(result).toBeNull();
  });
});

describe('notEmpty', () => {
  it('should return null when the control value is not a string', () => {
    const control = new FormControl(123);
    const result = notEmpty(control);
    expect(result).toBeNull();
  });

  it('should return required when the string is only whitespace', () => {
    const control = new FormControl('   ');
    const result = notEmpty(control);
    expect(result).toEqual({ required: true });
  });

  it('should return null when the string has non-whitespace characters', () => {
    const control = new FormControl('  hello  ');
    const result = notEmpty(control);
    expect(result).toBeNull();
  });
});
