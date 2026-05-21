'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { saveAuth } from '@/lib/auth';

export default function GoogleSignInButton({ onError, text = 'continue_with' }) {
  const router = useRouter();
  const buttonRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      onError?.('Google sign-in is not configured (NEXT_PUBLIC_GOOGLE_CLIENT_ID missing)');
      return;
    }

    let cancelled = false;

    const init = () => {
      if (cancelled || !buttonRef.current) return;
      if (!window.google?.accounts?.id) {
        setTimeout(init, 100);
        return;
      }
      if (initialized.current) return;
      initialized.current = true;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const data = await apiFetch('/auth/google', {
              method: 'POST',
              body: { idToken: response.credential }
            });
            saveAuth(data.token, data.user);
            router.push('/dashboard');
          } catch (err) {
            onError?.(err.message);
          }
        }
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text,
        shape: 'pill',
        width: 320,
        logo_alignment: 'left'
      });
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [router, onError, text]);

  return <div ref={buttonRef} className="flex justify-center" />;
}
