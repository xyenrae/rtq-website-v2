import type { Metadata } from 'next'
import { Fredoka } from 'next/font/google'
import { Toaster } from 'sonner'
import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import './globals.css'
import { createClient } from '@/lib/supabase/client'
import { unstable_cache } from 'next/cache'

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fredoka',
})

const getWebsiteSettings = unstable_cache(
  async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('pengaturan_website')
      .select(
        'nama_rtq, deskripsi_singkat, meta_title, meta_description, og_image_url, favicon_url'
      )
      .single()
    return data
  },
  ['website-settings-v1'],
  { revalidate: 3600, tags: ['settings'] }
)

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings()

  const title = settings?.meta_title || settings?.nama_rtq || 'RTQ Al-Hikmah Ngurensiti'
  const description =
    settings?.meta_description || settings?.deskripsi_singkat || "Lembaga pendidikan Al-Qur'an"
  const ogImage = settings?.og_image_url || '/images/logo-rtq.png'
  const favicon = settings?.favicon_url || '/favicon.ico'

  return {
    title: {
      template: `%s | ${settings?.nama_rtq || 'RTQ Al-Hikmah'}`,
      default: title,
    },
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage }],
    },
    icons: {
      icon: favicon,
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={fredoka.variable}>
      <body className="antialiased bg-background text-foreground w-screen overflow-x-hidden font-fredoka">
        <NextTopLoader color="var(--primary)" showSpinner={false} />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ConditionalLayout>{children}</ConditionalLayout>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
