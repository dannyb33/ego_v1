'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Amplify } from 'aws-amplify';
import { awsConfig } from '@/lib/aws-config';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

// Configure Amplify
Amplify.configure(awsConfig);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}