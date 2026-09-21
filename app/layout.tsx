import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Taquería La Tía',
  description: 'Tacos que se disfrutan como en familia.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
