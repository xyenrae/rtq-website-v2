'use client'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, FormEvent } from 'react'
import { IconBrandWhatsapp } from '@tabler/icons-react'
import { MapPin, MessageSquare, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export default function KontakPage() {
  const supabase = createClient()
  const [formData, setFormData] = useState({
    fullName: '',
    message: '',
  })
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase.from('settings').select('phone_number').limit(1)

      if (error) {
        console.error(error)
      } else {
        const number = data[0]?.phone_number
        setWhatsappNumber(number)
      }
    }

    fetchSettings()
  }, [supabase])

  const generateWhatsAppMessage = (name: string, message: string) => {
    const template = `Assalamu'alaikum Warahmatullahi Wabarakatuh,

Saya ${name} ingin berkonsultasi/bertanya:

${message}

Jazakumullah khairan katsiran.`

    return encodeURIComponent(template)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const { fullName, message } = formData
    if (!fullName || !message) return

    setIsLoading(true)
    const finalMessage = generateWhatsAppMessage(fullName, message)
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${finalMessage}`
    window.open(whatsappURL, '_blank')
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <Badge
          variant="secondary"
          className="mb-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
        >
          <Phone className="w-3 h-3 mr-1" />
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
                <MessageSquare className="w-4 h-4 text-primary" />
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
                disabled={isLoading || !formData.fullName || !formData.message}
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
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Lokasi Kami</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  TPQ Alhikmah Ngurensiti
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.585855355361!2d111.08164387475487!3d-6.698103893297417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e70d5a33a27fecf%3A0x8d549f17bc450140!2sTPQ%20Alhikmah%20Ngurensiti!5e0!3m2!1sen!2sid!4v1739173001291!5m2!1sen!2sid"
              width="100%"
              height="340"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="eager"
              title="Lokasi TPQ Alhikmah Ngurensiti"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
