import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { NextUIProvider } from "@nextui-org/system";
import { Toaster } from 'react-hot-toast';
import Image from "next/image";
import styles from './page.module.css'
import ErrorBoundary from '@/components/ErrorBoundary';

// Images
import Logo from '../assets/icons/logo-white.png'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Flotu | Formulario",
  description: "Formulario para facturación de Flotu",
  keywords: ['flotu', 'scooters', 'scooter', 'billing', 'facturación'],
  applicationName: 'Flotu Billing',
  abstract:'Formulario para facturar a los clientes de flotu',
  category: 'billing'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${styles.main}`}
      >
        <NextUIProvider>
          <ErrorBoundary>
            <Image alt='logo' height={40} width={80} className='absolute top-5 right-3 object-contain z-10' src={Logo}/>
            {children}
            <Toaster />
          </ErrorBoundary>
        </NextUIProvider>
      </body>
    </html>
  );
}
