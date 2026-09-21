export const metadata = {
  title: 'Taquería La Tía',
  description: 'Tacos que se disfrutan como en familia.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
