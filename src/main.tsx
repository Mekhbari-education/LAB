import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient.ts';
import App from './App.tsx';
import './index.css';
import './i18n';

if (typeof window !== 'undefined') {
  const hash = window.location.hash || '';
  const navEntry = performance.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming | undefined;
  const isReload = navEntry?.type === 'reload';
  const isAuthOrLegalRoute =
    hash.startsWith('#/login') ||
    hash.startsWith('#/signup') ||
    hash.startsWith('#/privacy-policy') ||
    hash.startsWith('#/data-deletion') ||
    hash.startsWith('#/terms-of-service');
  const isGlasswareBreakageEntry = hash.startsWith('#/glassware-breakage');

  if (isGlasswareBreakageEntry || (isReload && hash && hash !== '#/' && !isAuthOrLegalRoute)) {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/`);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
