import type { Metadata, Viewport } from 'next'
import { DM_Sans, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { HydrationBeacon } from '@/components/HydrationBeacon'

/* Fonts are downloaded at build time and self-hosted in the export, so the
   report has no runtime dependency on Google Fonts. */
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Align HCM | July 2026 Growth & Attribution Report',
  description:
    'Align HCM July 2026 growth report: corrected organic lead attribution, the ranking keyword portfolio, and live Google AI Overview evidence.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#0b1d2d',
  width: 'device-width',
  initialScale: 1,
}

/**
 * Motion renders its `initial` state into the static HTML, which means the
 * exported markup ships with opacity:0 on every animated block. Two safety
 * nets make sure an animation can never be the reason the report is
 * unreadable:
 *
 *   1. <noscript> — JS disabled entirely. Zero flash, pure CSS.
 *   2. the beacon timer — JS on but hydration failed. Only fires when the
 *      beacon never reported in, so working pages animate normally.
 */
const FAILSAFE = `window.__reportHydrated=false;setTimeout(function(){
if(!window.__reportHydrated){document.documentElement.classList.add('no-js')}},5000);`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jakarta.variable}`}>
      <head>
        <noscript>
          <style>{`[data-pop]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <script dangerouslySetInnerHTML={{ __html: FAILSAFE }} />
      </head>
      <body>
        <HydrationBeacon />
        {children}
      </body>
    </html>
  )
}
