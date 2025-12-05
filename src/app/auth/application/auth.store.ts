import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../domain/model/user.entity';
import { LoginCredentials } from '../domain/model/login-credentials';
import { RegisterData } from '../domain/model/register-data';
import { AuthApi } from '../infrastructure/auth-api';
import { JwtTokenService } from '../infrastructure/jwt-token';

/**
 * Store for managing authentication state and operations.
 * @remarks
 * This service orchestrates authentication use cases and manages auth state.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  private readonly userSignal = signal<User | null>(null);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly initializedSignal = signal<boolean>(false);
  private initializationPromise: Promise<void> | null = null;

  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly initialized = this.initializedSignal.asReadonly();

  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly currentUser = computed(() => this.user());
  readonly currentUserName = computed(() => this.user()?.displayName || 'Usuario');
  readonly currentUserRoles = computed(() => this.user()?.roles || []);
  readonly isAdmin = computed(() => this.user()?.isAdmin() || false);

  constructor(
    private authApi: AuthApi,
    private tokenService: JwtTokenService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Initializes authentication state from stored token.
   */
  private initializeAuth(): void {
    this.initializationPromise = new Promise<void>((resolve) => {
      if (this.tokenService.hasToken() && !this.tokenService.isTokenExpired()) {
        const decoded = this.tokenService.decodeToken();
        if (decoded) {
          const userId = String(decoded.sub);

          // Obtener información completa del usuario incluyendo los roles y permisos
          this.authApi.getUserById(userId).subscribe({
            next: (userData) => {
              this.userSignal.set(new User({
                id: userId,
                email: userData.email || decoded.email,
                roles: userData.roles || [],
                permissions: userData.permissions || [],
                token: this.tokenService.getToken() || undefined
              }));
              this.initializedSignal.set(true);
              resolve();
            },
            error: () => {
              // Si falla la petición, usar datos básicos del JWT
              this.userSignal.set(new User({
                id: userId,
                email: decoded.email,
                roles: [],
                permissions: [],
                token: this.tokenService.getToken() || undefined
              }));
              this.initializedSignal.set(true);
              resolve();
            }
          });
        } else {
          this.initializedSignal.set(true);
          resolve();
        }
      } else {
        this.initializedSignal.set(true);
        resolve();
      }
    });
  }

  /**
   * Waits for the authentication store to be fully initialized.
   * @returns A promise that resolves when initialization is complete.
   */
  waitForInitialization(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    return Promise.resolve();
  }

  /**
   * Authenticates a user with the provided credentials.
   * @param credentials - The login credentials.
   * @param returnUrl - Optional URL to redirect to after successful login.
   */
  login(credentials: LoginCredentials, returnUrl: string = '/dashboard'): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.authApi.signIn(credentials).subscribe({
      next: (response) => {
        this.tokenService.setToken(response.token);

        const userId = String(response.id);

        this.authApi.getUserById(userId).subscribe({
          next: (userData) => {
            this.userSignal.set(new User({
              id: userId,
              email: response.email,
              roles: userData.roles || [],
              permissions: userData.permissions || [],
              token: response.token
            }));

            this.loadingSignal.set(false);
            this.router.navigateByUrl(returnUrl);
          },
          error: () => {
            // If user fetch fails, use basic data from sign-in response
            this.userSignal.set(new User({
              id: userId,
              email: response.email,
              roles: [],
              permissions: [],
              token: response.token
            }));

            this.loadingSignal.set(false);
            this.router.navigateByUrl(returnUrl);
          }
        });
      },
      error: (err: Error) => {
        this.errorSignal.set(this.formatError(err, 'Error durante el inicio de sesión'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Registers a new user with the provided data.
   * Automatically logs in the user after successful registration.
   * @param data - The registration data.
   */
  register(data: RegisterData): void {
    // Validate passwords match before sending to API
    if (!data.passwordsMatch()) {
      this.errorSignal.set('Las contraseñas no coinciden');
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.authApi.signUp(data).subscribe({
      next: (response) => {
        // Sign-up response includes token for auto-login
        // Store the token FIRST
        this.tokenService.setToken(response.token);

        const userId = String(response.id);

        // Set user immediately with basic info from response to ensure authGuard passes
        // New sign-up users are always ROLE_ADMIN
        this.userSignal.set(new User({
          id: userId,
          email: response.email,
          roles: ['ROLE_ADMIN'],
          permissions: [],
          token: response.token
        }));

        // Get complete user info including roles and permissions (async, update later)
        this.authApi.getUserById(userId).subscribe({
          next: (userData) => {
            // Update user with complete information
            this.userSignal.set(new User({
              id: userId,
              email: response.email,
              roles: userData.roles || ['ROLE_ADMIN'],
              permissions: userData.permissions || [],
              token: response.token
            }));
          },
          error: () => {
            // If user fetch fails, keep the basic user info already set
            // This is fine, user is already authenticated
          }
        });

        this.loadingSignal.set(false);
        // Redirect to dashboard after successful registration and auto-login
        // User is already set, so authGuard will pass
        this.router.navigate(['/dashboard']).catch(err => {
          console.error('Navigation error:', err);
        });
      },
      error: (err: Error) => {
        this.errorSignal.set(this.formatError(err, 'Error durante el registro'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Logs out the current user (client-side only).
   */
  logout(): void {
    this.tokenService.removeToken();
    this.userSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Checks if the current user has a specific role.
   * @param role - The role to check.
   * @returns True if the user has the role.
   */
  hasRole(role: string): boolean {
    return this.user()?.hasRole(role) || false;
  }

  /**
   * Checks if the current user has any of the specified roles.
   * @param roles - Array of roles to check.
   * @returns True if the user has at least one of the roles.
   */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.currentUserRoles();
    return roles.some(role => userRoles.includes(role));
  }

  /**
   * Clears the current error.
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Formats error messages for better user experience.
   * @param error - The error object.
   * @param fallback - The fallback message if error is not an Error instance.
   * @returns A formatted error message.
   */
  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return 'Credenciales inválidas';
      }
      if (error.message.includes('Resource not found')) {
        return `${fallback}: No encontrado`;
      }
      return error.message;
    }
    return fallback;
  }
}
