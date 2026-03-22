'use client';

import { useEffect, useRef } from 'react';
import { signOut } from './signoutServer';

// 2 hours in milliseconds
const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000;

/**
 * Automatically logs the user out when their session expires due to inactivity.
 */
export function AutoLogoutProvider({ expiresAt, children }: { expiresAt: number, children: React.ReactNode }) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      console.log('Session expired due to inactivity, auto-logging out...');
      try {
        await signOut();
      } catch (error) {
        // Next.js redirect() throws an error internally. We can safely ignore it.
      }
      // Force navigation to ensure the UI actually changes
      window.location.href = '/auth/sign-in';
    }, INACTIVITY_TIMEOUT_MS);
  };

  useEffect(() => {
    // Initial timer setup
    resetTimer();

    // Setup event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  return <>{children}</>;
}
