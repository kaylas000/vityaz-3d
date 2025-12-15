import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Failed to verify password');
  }
}

/**
 * Check if password meets security requirements
 */
export function isPasswordStrong(password: string): boolean {
  // At least 8 characters
  if (password.length < 8) return false;

  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) return false;

  // At least one lowercase letter
  if (!/[a-z]/.test(password)) return false;

  // At least one digit
  if (!/\d/.test(password)) return false;

  // At least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

  return true;
}
