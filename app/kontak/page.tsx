'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, SyntheticEvent } from 'react'
import { motion } from 'motion/react'
import {
  IconBrandWhatsapp,
  IconMapPin,
  IconMessage,
  IconPhone,
  IconMail,
  IconClock,
} from '@tabler/icons-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type PengaturanWebsite = {
  no_whatsapp: string | null
  google_maps_embed: string | null
  nama_rtq: string
  alamat: string | null
  email: string | null
}

export default function KontakPage() {
  const supabase = createClient()
  const [formData, setFormData] = useState({ fullName: '', message: '' })
  const [pengaturan, setPengaturan] = useState<PengaturanWebsite | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchPengaturan = async () => {
      const { data, error } = await supabase
        .from('pengaturan_website')
        .select('no_whatsapp, google_maps_embed, nama_rtq, alamat, email')
        .limit(1)
        .single()
      if (!error && data) setPengaturan(data)
    }
    fetchPengaturan()
  }, [supabase])

  const generateWhatsAppMessage = (name: string, message: string) => {
    const template = `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\nSaya ${name} ingin berkonsultasi/bertanya:\n\n${message}\n\nJazakumullah khairan katsiran.`
    return encodeURIComponent(template)
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { fullName, message } = formData
    if (!fullName || !message || !pengaturan?.no_whatsapp) return
    setIsLoading(true)
    const finalMessage = generateWhatsAppMessage(fullName, message)
    window.open(`https://wa.me/${pengaturan.no_whatsapp}?text=${finalMessage}`, '_blank')
    setIsLoading(false)
  }

  const contactItems = [
    {
      icon: <IconClock size={16} />,
      label: 'Jam Operasional',
      value: 'Sabtu – Kamis, 13.30 – 16.30 WIB',
      href: null,
    },
    ...(pengaturan?.no_whatsapp
      ? [
          {
            icon: <IconBrandWhatsapp size={16} />,
            label: 'WhatsApp',
            value: `+${pengaturan.no_whatsapp}`,
            href: `https://wa.me/${pengaturan.no_whatsapp}`,
            external: true,
          },
        ]
      : []),
    ...(pengaturan?.email
      ? [
          {
            icon: <IconMail size={16} />,
            label: 'Email',
            value: pengaturan.email,
            href: `mailto:${pengaturan.email}`,
            external: false,
          },
        ]
      : []),
    ...(pengaturan?.alamat
      ? [
          {
            icon: <IconMapPin size={16} />,
            label: 'Alamat',
            value: pengaturan.alamat,
            href: null,
          },
        ]
      : []),
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Row 1: Header (kiri) + Informasi Kontak (kanan) ── */}
      <section className="container mx-auto px-4 py-14 md:py-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
          {/* Kiri — Header */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="flex-1 space-y-5"
          >
            <Badge
              variant="outline"
              className="border-primary bg-primary/5 px-3 py-1 text-[10px] text-primary md:text-xs"
            >
              <IconPhone size={11} className="mr-1.5" />
              Kontak Kami
            </Badge>

            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
              Hubungi <span className="text-primary block mt-1">Kami</span>
            </h1>

            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
              Silakan sampaikan pertanyaan atau konsultasi Anda. Tim kami siap membantu melalui
              WhatsApp maupun email selama jam operasional.
            </p>
          </motion.div>

          {/* Kanan — Informasi Kontak */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="flex-1"
          >
            <Card className="shadow-none border border-border/60">
              <CardContent className="p-5 md:p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-5">
                  Informasi Kontak
                </p>
                <div className="space-y-0 divide-y divide-border/50">
                  {contactItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                      <div className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary mt-0.5">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs font-semibold md:text-sm">{item.label}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            target={item.external ? '_blank' : undefined}
                            rel={item.external ? 'noreferrer' : undefined}
                            className="text-xs text-primary hover:underline md:text-sm"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-xs text-muted-foreground md:text-sm leading-relaxed">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Separator className="opacity-40" />

      {/* ── Row 2: Form Konsultasi + Peta ── */}
      <section className="container mx-auto px-4 pb-14 md:pb-20">
        <div className="mb-8 md:mb-10">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            Kirim Pesan
          </p>
          <h2 className="text-2xl font-bold md:text-3xl">Konsultasi Langsung</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
            Isi form di bawah, pesan akan langsung diarahkan ke WhatsApp kami.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Form Konsultasi */}
          <Card className="shadow-none border border-border/60 transition-all hover:border-primary/30 hover:shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <IconMessage size={18} />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold md:text-base">
                    Form Konsultasi
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 md:text-sm">
                    Isi form berikut, pesan akan dikirim via WhatsApp
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-medium md:text-sm">
                    Nama Lengkap
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Masukkan nama lengkap Anda"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-xs font-medium md:text-sm">
                    Pesan
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tuliskan pertanyaan atau pesan Anda di sini..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="text-sm resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-medium gap-2 rounded-full"
                  disabled={
                    isLoading || !formData.fullName || !formData.message || !pengaturan?.no_whatsapp
                  }
                >
                  <IconBrandWhatsapp size={17} />
                  Kirim via WhatsApp
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Peta */}
          <Card className="shadow-none border border-border/60 overflow-hidden p-0 transition-all hover:border-primary/30 hover:shadow-sm">
            <CardHeader className="px-5 pt-4 pb-3 md:px-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <IconMapPin size={16} />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold md:text-base">Lokasi Kami</CardTitle>
                  {pengaturan?.nama_rtq && (
                    <CardDescription className="text-xs mt-0.5 md:text-sm">
                      {pengaturan.nama_rtq}
                      {pengaturan.alamat && <span className="block">{pengaturan.alamat}</span>}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {pengaturan?.google_maps_embed ? (
                <iframe
                  src={pengaturan.google_maps_embed}
                  width="100%"
                  height="360"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="eager"
                  title={`Lokasi ${pengaturan?.nama_rtq ?? 'RTQ'}`}
                />
              ) : (
                <div className="h-[360px] flex items-center justify-center bg-muted text-muted-foreground text-xs md:text-sm">
                  Peta belum dikonfigurasi
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
