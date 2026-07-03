import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthStore } from '../../../application/auth.store';
import { RecoverPasswordData } from '../../../domain/model/recover-password-data';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';

/**
 * Password recovery component.
 * Allows users to reset their password by email using the users API.
 */
@Component({
  selector: 'app-recovery',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    TranslateModule,
    LanguageSwitcher
  ],
  templateUrl: './recovery.html',
  styleUrl: './recovery.css'
})
export class RecoveryComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected translate = inject(TranslateService);
  protected authStore = inject(AuthStore);

  protected recoveryForm = this.fb.group({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    }),
    confirmPassword: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  }, { validators: this.passwordMatchValidator });

  protected t(key: string): string {
    return this.translate.instant(key);
  }

  ngOnDestroy(): void {
    this.authStore.clearError();
    this.authStore.clearRecoverySuccess();
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  protected onSubmit(): void {
    if (this.recoveryForm.invalid) {
      this.recoveryForm.markAllAsTouched();
      return;
    }

    const data = new RecoverPasswordData({
      email: this.recoveryForm.value.email!,
      password: this.recoveryForm.value.password!,
      confirmPassword: this.recoveryForm.value.confirmPassword!
    });

    this.authStore.recoverPassword(data);
  }

  protected navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
