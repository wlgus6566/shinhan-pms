'use client';

import { AuthProvider } from '@/context/AuthContext';
import { SWRProvider } from '@/lib/swr-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SWRProvider>
  );
}
