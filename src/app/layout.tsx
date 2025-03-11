import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin', 'latin-ext'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Kalkulatory Online',
    default: 'Kalkulatory Online - Oblicz Wynagrodzenie, Składki IKE i IKZE',
  },
  description: 'Kalkulatory online do obliczania wynagrodzeń na UoP, B2B, składek IKE i IKZE oraz innych przydatnych kalkulacji.',
  keywords: 'kalkulatory, wynagrodzenie, UoP, B2B, składki, IKE, IKZE, kalkulator online, obliczenia wynagrodzenia',
  authors: [{ name: 'Kajetan Jędrych' }],
  creator: 'Kalkulatory.org',
  openGraph: {
    title: 'Kalkulatory Online - Oblicz Wynagrodzenie, Składki IKE i IKZE',
    description: 'Oblicz wynagrodzenie na UoP, B2B oraz składki IKE i IKZE za pomocą naszych intuicyjnych kalkulatorów online.',
    images: ['/calc/public/logo.svg'],
    url: 'https://kalkulatory.org',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kalkulatory Online - Oblicz Wynagrodzenie, Składki IKE i IKZE',
    description: 'Oblicz wynagrodzenie na UoP, B2B oraz składki IKE i IKZE z pomocą naszych kalkulatorów.',
    images: ['/calc/public/logo.svg'],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <head>
        <link rel="icon" type="image/svg+xml" href="/assets/calculator.svg" />
      </head>
      <body className={`${inter.className} font-sans min-h-screen flex flex-col`}>
        {/* Google Consent Mode Script */}
        <Script id="google-consent-mode" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            gtag("consent", "default", {
              ad_storage: "denied",
              analytics_storage: "denied",
            });

            gtag("js", new Date());
            gtag("config", "G-Q4C8T0ZG4G");
          `}
        </Script>
        
        {/* Google Analytics */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-Q4C8T0ZG4G"
          strategy="afterInteractive"
        />
        
        {/* Google AdSense */}
        <Script 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5519236599585871"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        
        {/* Google Consent Update Script */}
        <Script id="consent-update" strategy="afterInteractive">
          {`
            function updateConsent(adConsent, analyticsConsent) {
              window.gtag("consent", "update", {
                ad_storage: adConsent,
                analytics_storage: analyticsConsent,
              });
            }
          `}
        </Script>
        
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <CookieBanner />
        <Footer />
      </body>
    </html>
  )
}