/**
 * Local Test Access Utility
 *
 * Per BACKEND_HANDOFF.md Section 5 & Rule 99:
 * "The owner may enter the studio without a Chog while running the app on their own computer
 * (development mode), using a wallet address set in a local, uncommitted environment file.
 * That wallet may pick any supporting-cast Chog as its hero, and the studio shows a small
 * 'Test access' label. In the deployed site this must do nothing: production ignores the setting
 * and the real ownership check applies to everyone. No hidden bypass on the live site."
 */

/**
 * Validates if local test access is enabled for the given wallet address.
 * 
 * CRITICAL PRODUCTION SAFEGUARDS:
 * 1. import.meta.env.DEV must be strictly true.
 * 2. import.meta.env.PROD must be strictly false.
 * 3. import.meta.env.MODE must be 'development'.
 * In any production build, this function always returns false and cannot be bypassed.
 */
export function isTestAccessActive(userAddress: string | null | undefined): boolean {
  // HARD PRODUCTION SAFEGUARD:
  // In production builds (vite build), import.meta.env.DEV is replaced with false at compile time,
  // guaranteeing this code branch never executes in production.
  if (!import.meta.env.DEV || import.meta.env.PROD || import.meta.env.MODE === 'production') {
    return false;
  }

  if (!userAddress) {
    return false;
  }

  const configuredTestAddress = import.meta.env.VITE_TEST_WALLET_ADDRESS;
  if (!configuredTestAddress || typeof configuredTestAddress !== 'string') {
    return false;
  }

  const cleanConfigured = configuredTestAddress.trim().toLowerCase();
  const cleanUser = userAddress.trim().toLowerCase();

  return cleanConfigured.length > 0 && cleanConfigured === cleanUser;
}

/**
 * Returns the configured test wallet address (development only).
 * Always returns null in production builds.
 */
export function getTestWalletAddress(): string | null {
  if (!import.meta.env.DEV || import.meta.env.PROD || import.meta.env.MODE === 'production') {
    return null;
  }
  const configured = import.meta.env.VITE_TEST_WALLET_ADDRESS;
  return configured && typeof configured === 'string' ? configured.trim() : null;
}
