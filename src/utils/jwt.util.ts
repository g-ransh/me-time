import jwt from 'jsonwebtoken';
import { env } from '../config/env.config'; // Leverages the strict environment validator built in Layer 2

interface TokenPayload {
  userId: string;
}

/**
 * Generates a structurally sound, short-lived JSON Web Token for user sessions
 * @param userId Unique database identification string of the authenticated user
 */
export const generateAccessToken = (userId: string): string => {
  const payload: TokenPayload = { userId };
  
  // Utilizes your validated JWT_SECRET and enforces a tight 15-minute expiration boundary
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '15m', 
  });
};

/**
 * Cryptographically verifies an incoming session token against your environment secret
 * @param token The raw token extracted from the request cookies
 */
export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null; // Return null if the token is altered, malformed, or expired
  }
};