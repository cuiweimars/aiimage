import '../styles/globals.css'
import { IntlProvider } from 'next-intl';
import type { AppProps } from 'next/app';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SessionProvider } from "next-auth/react";

export default function MyApp({ Component, pageProps }: AppProps) {
  const { locale, messages, ...rest } = pageProps;
  return (
    <SessionProvider>
      <IntlProvider locale={locale} messages={messages}>
        <div className="dark">
          <Header />
          <Component {...rest} locale={locale} messages={messages} />
          <Footer />
        </div>
      </IntlProvider>
    </SessionProvider>
  );
} 