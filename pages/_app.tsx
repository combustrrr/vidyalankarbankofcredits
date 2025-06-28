import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { StudentAuthProvider } from '@/contexts/StudentAuthContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AdminAuthProvider>
      <StudentAuthProvider>
        <Component {...pageProps} />
      </StudentAuthProvider>
    </AdminAuthProvider>
  );
}

export default MyApp;
