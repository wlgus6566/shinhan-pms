import type { Metadata, Viewport } from 'next';
import { ViewTransitions } from 'next-view-transitions';
import './globals.css';
import { Providers } from '@/components/Providers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: '이모션 PMS',
  description: '이모션의 프로젝트 및 업무 관리를 위한 통합 프로젝트 관리 시스템',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="ko" suppressHydrationWarning>
        <body className="antialiased">
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ViewTransitions>
  );
}
