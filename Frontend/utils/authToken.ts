// Authentication token management utilities

const TOKEN_KEY = 'accessToken';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';

export class AuthTokenManager {
  /**
   * Store the access token and its expiry time
   */
  static setToken(accessToken: string, expiresIn: number): void {
    localStorage.setItem(TOKEN_KEY, accessToken);
    const expiryTime = Date.now() + expiresIn * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  /**
   * Get the current access token
   */
  static getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    if (this.isTokenExpired()) {
      this.clearToken();
      return null;
    }

    return token;
  }

  /**
   * Check if the token is expired
   */
  static isTokenExpired(): boolean {
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryTime) return true;

    return Date.now() > parseInt(expiryTime, 10);
  }

  /**
   * Clear the stored token
   */
  static clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }

  /**
   * Get the token for use in HTTP headers
   */
  static getAuthHeader(): string | null {
    const token = this.getToken();
    return token ? `Bearer ${token}` : null;
  }
}
