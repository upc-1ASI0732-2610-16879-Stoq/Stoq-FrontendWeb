/**
 * Domain model for password recovery data.
 */
export class RecoverPasswordData {
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;

  constructor(data: { email: string; password: string; confirmPassword: string }) {
    this.email = data.email;
    this.password = data.password;
    this.confirmPassword = data.confirmPassword;
  }

  passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }
}
