import { Injectable } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { AuthApiEndpoint } from './auth-api-endpoint';
import { HttpClient } from '@angular/common/http';
import { LoginCredentials } from '../domain/model/login-credentials';
import { RegisterData } from '../domain/model/register-data';
import { Observable } from 'rxjs';
import { SignInResponse, SignUpResponse, UserResource } from './auth-response';

@Injectable({ providedIn: 'root' })
export class AuthApi extends BaseApi {
  private readonly authEndpoint: AuthApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.authEndpoint = new AuthApiEndpoint(http);
  }

  /**
   * Authenticates a user with the provided credentials.
   * @param credentials - The login credentials.
   * @returns An Observable of the sign-in response.
   */
  signIn(credentials: LoginCredentials): Observable<SignInResponse> {
    return this.authEndpoint.signIn(credentials);
  }

  /**
   * Registers a new user with the provided data.
   * @param data - The registration data.
   * @returns An Observable of the sign-up response.
   */
  signUp(data: RegisterData): Observable<SignUpResponse> {
    return this.authEndpoint.signUp(data);
  }

  /**
   * Gets user information by ID.
   * @param userId - The user ID.
   * @returns An Observable of the User resource.
   */
  getUserById(userId: string): Observable<UserResource> {
    return this.authEndpoint.getUserById(userId);
  }

  /**
   * Resets a user's password using the public recovery endpoint.
   * @param email - The account email.
   * @param password - The new password.
   * @returns An Observable that completes when the password is reset.
   */
  resetPassword(email: string, password: string): Observable<void> {
    return this.authEndpoint.resetPassword(email, password);
  }
}
