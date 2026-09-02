import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from '../src/App';
import { LandingPage } from '../src/components/LandingPage';
import { AuthModal } from '../src/components/AuthModal';
import { RoleIndicatorBanner } from '../src/components/RoleIndicatorBanner';
import { AuthProvider } from '../src/context/AuthContext';
import { DEFAULT_WEDDING_STATE } from '../src/types/wedding';

describe('App & Component SSR Render Smoke Test', () => {
  it('should render RoleIndicatorBanner without crashing', () => {
    const html = renderToString(
      <AuthProvider>
        <RoleIndicatorBanner />
      </AuthProvider>
    );
    expect(html).toContain('AmantranLink Couple Suite');
  });

  it('should render AuthModal without crashing', () => {
    const html = renderToString(
      <AuthProvider>
        <AuthModal />
      </AuthProvider>
    );
    expect(html).toBeDefined();
  });

  it('should render LandingPage without crashing', () => {
    const html = renderToString(
      <AuthProvider>
        <LandingPage
          state={DEFAULT_WEDDING_STATE}
          onEnterStudio={() => {}}
          onPreviewTheme={() => {}}
        />
      </AuthProvider>
    );
    expect(html).toContain('AMANTRAN');
  });

  it('should render App root component without crashing', () => {
    const html = renderToString(<App />);
    expect(html).toBeDefined();
    expect(html).toContain('AMANTRAN');
  });
});
