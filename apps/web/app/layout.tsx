import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ViewTransitions } from 'next-view-transitions';
import './globals.css';
import { Providers } from '@/components/Providers';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

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
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ViewTransitions>
  );
}
