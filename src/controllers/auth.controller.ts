import { Request, Response } from 'express';
import { generateAccessToken } from '../utils/jwt.util';
import { env } from '../config/env.config';

export const AuthController = {
  /**
   * Example login handler showing how to drop tokens into hardened cookies
   */
  async mockLogin(req: Request, res: Response): Promise<void> {
    // ... validation and password checks would occur here ...
    const mockUserId = "uuid-randomized-user-id";
    const token = generateAccessToken(mockUserId);

    // Hardening cookie transport properties to maximize session protection
    res.cookie('auth_token', token, {
      httpOnly: true, // Completely blocks client-side JavaScript from accessing and stealing the token
      secure: env.NODE_ENV === 'production', // Forces the browser to send cookies exclusively over encrypted HTTPS paths
      sameSite: 'lax', // Protects state-changing operations from cross-origin CSRF attacks
      maxAge: 15 * 60 * 1000, // Syncs cookie expiration exactly to the 15-minute token lifecycle
    });

    res.status(200).json({ status: 'success', message: 'Logged in securely.' });
  },

  /**
   * Bulletproof logout logic that explicitly clears session traces from the client configuration
   */
  async logout(req: Request, res: Response): Promise<void> {
    // Explicitly destroys and invalidates the authentication cookie path directly on the server response
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.status(200).json({ 
      status: 'success', 
      message: 'Session successfully destroyed on the server. You are logged out.' 
    });
  }
};