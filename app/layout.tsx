import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import './globals.css'
import { createClient } from '@/lib/supabase/server' // Pastikan anda punya helper server client

// Fungsi untuk fetch metadata dinamis dari database
export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('pengaturan_website')
    .select('nama_rtq, deskripsi_singkat, meta_title, meta_description, og_image_url, favicon_url')
    .single()

  const title = settings?.meta_title || settings?.nama_rtq || 'RTQ Al-Hikmah Ngurensiti'
  const description =
    settings?.meta_description ||
    settings?.deskripsi_singkat ||
    "Lembaga pendidikan Al-Qur'an berbasis metode Yanbu'a"
  const ogImage = settings?.og_image_url || '/images/logo-rtq.png'
  const favicon = settings?.favicon_url || '/favicon.ico'

  return {
    title: {
      template: `%s | ${settings?.nama_rtq || 'RTQ Al-Hikmah'}`,
      default: title,
    },
    description: description,
    keywords: [
      settings?.nama_rtq || 'RTQ Al-Hikmah',
      "Pendidikan Al-Qur'an",
      "Metode Yanbu'a",
      'Kabupaten Pati',
    ],
    openGraph: {
      title: title,
      description: description,
      url: 'https://rtq-website.vercel.app/',
      siteName: settings?.nama_rtq || 'RTQ Al-Hikmah',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: settings?.nama_rtq || 'RTQ Al-Hikmah',
        },
      ],
      locale: 'id_ID',
      type: 'website',
    },
    icons: {
      icon: favicon,
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 text-slate-900 w-screen overflow-x-hidden font-sans">
        {/* Progress bar saat pindah halaman */}
        <NextTopLoader color="#22c55e" showSpinner={false} />

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ConditionalLayout>{children}</ConditionalLayout>
          {/* Toaster untuk notifikasi */}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
