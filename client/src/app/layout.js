import { Inter } from 'next/font/google';
import './globals.css';
import { TickerProvider } from '../context/TickerContext';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Open Stock Research — Fundamental Equity & Market Screener Suite',
  description: 'Self-hostable fundamental equity research, standardized financial statements, SEC filings, price history, and screening suite.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans flex flex-col">
        <TickerProvider>
          <Header />
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </TickerProvider>
      </body>
    </html>
  );
}
