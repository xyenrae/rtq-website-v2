'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IconTargetArrow, IconRocket, IconQuote } from '@tabler/icons-react'

export default function VisiMisi() {
  const [data, setData] = useState<{ visi: string; misi: string[] | null }>({
    visi: '',
    misi: [],
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: settings, error } = await supabase
        .from('pengaturan_website')
        .select('visi, misi')
        .single()

      if (!error && settings) {
        setData({
          visi: settings.visi || '',
          misi: settings.misi || [],
        })
      }
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  return (
    <section className="relative w-full py-20 md:py-28 overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Background Layer dengan Overlay Glassmorphism */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/bg-islami.jpg"
          alt="Background RTQ"
          fill
          className="object-cover opacity-15 scale-105"
        />
        {/* Menggunakan bg-background agar adaptif terhadap Light/Dark theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background/95 backdrop-blur-[2px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <div className="flex flex-col gap-16">
          {/* Header Section */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <Badge
              variant="outline"
              className="text-primary border-primary/50 bg-primary/10 px-4 py-1 uppercase tracking-widest font-semibold"
            >
              Prinsip Dasar
            </Badge>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Visi & <span className="text-primary">Misi Kami</span>
            </h2>
            <div className="h-1.5 w-20 bg-accent mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Kolom Visi - Menggunakan Card Shadcn */}
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/70 border-border backdrop-blur-md overflow-hidden shadow-sm">
                <CardContent className="p-8 md:p-10 relative">
                  <IconQuote className="absolute top-6 right-6 text-primary/10" size={80} />
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 bg-primary rounded-lg shadow-sm">
                      <IconTargetArrow size={24} className="text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-card-foreground">Visi Utama</h3>
                  </div>
                  <p className="text-xl md:text-2xl font-medium leading-relaxed italic text-muted-foreground relative z-10">
                    {loading ? 'Menghubungkan ke database...' : `"${data.visi}"`}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Kolom Misi - List Animatif */}
            <motion.div
              className="lg:col-span-7 space-y-4"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent rounded-lg text-accent-foreground shadow-sm">
                  <IconRocket size={24} />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-wide text-foreground">
                   Misi Pencapaian
                </h3>
              </div>

              <div className="grid gap-4">
                <AnimatePresence>
                  {data.misi?.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group flex items-start gap-4 p-5 rounded-xl bg-card/40 border border-border hover:border-primary/50 hover:bg-card/80 hover:shadow-sm transition-all duration-300 backdrop-blur-sm"
                    >
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {index + 1}
                      </span>
                      <p className="text-muted-foreground text-lg leading-relaxed group-hover:text-foreground transition-colors">
                        {item}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Dekorasi Bawah */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
    </section>
  )
}
