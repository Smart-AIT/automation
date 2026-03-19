'use client';

import { useEffect } from 'react';
import { signOut } from './signoutServer';

/**
 * Automatically logs the user out when their session expires.
 * @param expiresAt The timestamp (in seconds since epoch) when the session expires
 */
export function AutoLogoutProvider({ expiresAt, children }: { expiresAt: number, children: React.ReactNode }) {
  useEffect(() => {
    // Calculate time remaining in milliseconds
    const now = Math.floor(Date.now() / 1000);
    const timeRemainingSeconds = expiresAt - now;

    if (timeRemainingSeconds <= 0) {
      // Session already expired
      console.log('Session expired, auto-logging out...');
      signOut();
      return;
    }

    // Set a timeout to log out exactly when the session expires
    const timeoutMs = timeRemainingSeconds * 1000;
    console.log(`Auto-logout scheduled in ${timeRemainingSeconds} seconds`);

    const timeoutId = setTimeout(() => {
      console.log('Session expired, auto-logging out...');
      signOut();
    }, timeoutMs);

    return () => clearTimeout(timeoutId);
  }, [expiresAt]);

  return <>{children}</>;
}
