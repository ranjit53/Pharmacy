import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Pharmacy E-commerce Platform',
  description: 'Complete pharmacy e-commerce solution with admin panel and wholesale module',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

