
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { RootProviders } from '@/components/layout/RootProviders';

export const metadata: Metadata = {
  title: 'Axiom Frontier',
  description: 'A persistent AI-MMORPG driven by serverless game logic and an axiomatic world heartbeat.',
  other: {
    'ai-agent-entry-point': '/api/ai-agent-entry',
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#020203',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="font-body antialiased bg-background text-foreground custom-scrollbar overflow-x-hidden" suppressHydrationWarning>
        <RootProviders>
          {children}
        </RootProviders>
      </body>
    </html>
  );
}
