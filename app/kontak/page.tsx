'use client'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, SyntheticEvent } from 'react'
import { IconBrandWhatsapp, IconMapPin, IconMessage, IconPhone } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

type PengaturanWebsite = {
  no_whatsapp: string | null
  google_maps_embed: string | null
  nama_rtq: string
  alamat: string | null
}

export default function KontakPage() {
  const supabase = createClient()
  const [formData, setFormData] = useState({
    fullName: '',
    message: '',
  })
  const [pengaturan, setPengaturan] = useState<PengaturanWebsite | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchPengaturan = async () => {
      const { data, error } = await supabase
        .from('pengaturan_website')
        .select('no_whatsapp, google_maps_embed, nama_rtq, alamat')
        .limit(1)
        .single()

      if (error) {
        console.error(error)
      } else {
        setPengaturan(data)
      }
    }

    fetchPengaturan()
  }, [supabase])

  const generateWhatsAppMessage = (name: string, message: string) => {
    const template = `Assalamu'alaikum Warahmatullahi Wabarakatuh,

Saya ${name} ingin berkonsultasi/bertanya:

${message}

Jazakumullah khairan katsiran.`

    return encodeURIComponent(template)
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { fullName, message } = formData
    if (!fullName || !message || !pengaturan?.no_whatsapp) return

    setIsLoading(true)
    const finalMessage = generateWhatsAppMessage(fullName, message)
    const whatsappURL = `https://wa.me/${pengaturan.no_whatsapp}?text=${finalMessage}`
    window.open(whatsappURL, '_blank')
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Badge
          variant="secondary"
          className="mb-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
        >
          <IconPhone size={12} className="mr-1" />
          Kontak Kami
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Hubungi Kami</h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          Silakan sampaikan pertanyaan atau konsultasi Anda. Kami siap membantu melalui WhatsApp.
        </p>
        <Separator className="mt-6" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form Card */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <IconMessage size={16} className="text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Form Konsultasi</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Isi form berikut, pesan akan dikirim via WhatsApp
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  placeholder="Masukkan nama lengkap Anda"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">Pesan</Label>
                <Textarea
                  id="message"
                  placeholder="Tuliskan pertanyaan atau pesan Anda di sini..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-medium gap-2"
                disabled={
                  isLoading || !formData.fullName || !formData.message || !pengaturan?.no_whatsapp
                }
              >
                <IconBrandWhatsapp size={18} />
                Kirim via WhatsApp
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Map Card */}
        <Card className="shadow-sm border-border overflow-hidden p-0">
          <CardHeader className="pb-3 px-4 pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <IconMapPin size={16} className="text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Lokasi Kami</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {pengaturan?.nama_rtq ?? '—'}
                  {pengaturan?.alamat && (
                    <span className="block text-muted-foreground">{pengaturan.alamat}</span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {pengaturan?.google_maps_embed ? (
              <iframe
                src={pengaturan.google_maps_embed}
                width="100%"
                height="340"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="eager"
                title={`Lokasi ${pengaturan.nama_rtq}`}
              />
            ) : (
              <div className="h-[340px] flex items-center justify-center bg-muted text-muted-foreground text-sm">
                Peta belum dikonfigurasi
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
