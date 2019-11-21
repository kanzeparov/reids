import { ErrorStateMatcher } from '@angular/material';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';

declare type Control = FormControl | null;
declare type Form = FormGroupDirective | NgForm | null;

export class InputErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: Control, form: Form): boolean {
    if (!control) {
      return false;
    }

    const isSubmitted = form && form.submitted;

    return Boolean(control.invalid && (!control.pristine || isSubmitted));
  }
}
