/**
 * Root Layout Wrapper
 * Integrates FloatingChat component globally
 */

import React from 'react';
import FloatingChat from '../components/FloatingChat';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      {children}
      <FloatingChat />
    </>
  );
}
