import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // Strikes the ideal balance between high cryptographic security and server performance

/**
 * Encrypts a plain text password using the industry-standard bcrypt algorithm
 * @param password The raw password string coming from a signup or reset form
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Safely compares a login attempt password against the securely hashed database password
 * @param password Attempted password input string
 * @param hash Secured hash string retrieved from the user record
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};