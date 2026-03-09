import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import './globals.css'

export const metadata: Metadata = {
  title: "RTQ Al-Hikmah Ngurensiti | Pendidikan Al-Qur'an Metode Yanbu'a di Pati",
  description:
    "Lembaga pendidikan Al-Qur'an berbasis metode Yanbu'a di Desa Ngurensiti, Kecamatan Wedarijaksa, Kabupaten Pati. Didukung program Imtihan resmi dari Lajnah Muroqobah Yanbu'a (LMY) Kabupaten Pati.",
  keywords: [
    'RTQ Al-Hikmah Ngurensiti',
    "Pendidikan Al-Qur'an Pati",
    "Metode Yanbu'a",
    "Lajnah Muroqobah Yanbu'a",
    'Kabupaten Pati',
  ],
  authors: [{ name: 'RTQ Al-Hikmah', url: 'https://rtq-website.vercel.app/' }],
  openGraph: {
    title: "RTQ Al-Hikmah Ngurensiti | Pendidikan Al-Qur'an Metode Yanbu'a di Pati",
    description: "Program belajar Al-Qur'an dengan kurikulum terstruktur dan metode Yanbu'a.",
    url: 'https://rtq-website.vercel.app/',
    siteName: 'RTQ Al-Hikmah Ngurensiti',
    images: [
      {
        url: '/images/logo-rtq.png',
        width: 1200,
        height: 630,
        alt: 'RTQ Al-Hikmah Ngurensiti',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 text-slate-900 w-screen overflow-x-hidden">
        {/* Progress bar saat pindah halaman */}
        <NextTopLoader color="#22c55e" showSpinner={false} />

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ConditionalLayout>{children}</ConditionalLayout>
          {/* Mengganti ToastContainer dengan Sonner Toaster */}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
