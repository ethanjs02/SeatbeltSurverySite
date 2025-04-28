import { ReactNode } from 'react';
import { Metadata } from 'next';
import '../app/globals.css';
import AuthProvider from '../contexts/AuthContext';
import AppContent from './AppContent';
import theme from '../theme/theme';

export const metadata: Metadata = {
  title: 'Seatbelt Tracker',
  description: 'Data collection and visualization app',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppContent>{children}</AppContent>
        </AuthProvider>
      </body>
    </html>
  );
}
