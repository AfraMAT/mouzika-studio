'use client';

import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { ProgressProvider } from '@/lib/store/progress';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <ProgressProvider>{children}</ProgressProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
