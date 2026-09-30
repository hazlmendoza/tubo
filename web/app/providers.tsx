'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/lib/auth-context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>
        {children}
      </AppShell>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}