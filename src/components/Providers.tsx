'use client';

import { I18nProvider } from '@/lib/i18n';
import { ProgressProvider } from '@/lib/store/progress';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ProgressProvider>{children}</ProgressProvider>
    </I18nProvider>
  );
}
