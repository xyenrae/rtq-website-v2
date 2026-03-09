'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import {
  IconBrandWhatsapp,
  IconMail,
  IconMapPin,
  IconInfoCircle,
  IconClock,
  IconBuildingStore,
  IconUsers,
  IconClipboardCheck,
  IconSchool,
  IconChevronDown,
} from '@tabler/icons-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const RegistrationPage = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [email, setEmail] = useState('')
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('phone_number, email')
        .limit(1)
        .single()

      if (!error && data) {
        setWhatsappNumber(data.phone_number)
        setEmail(data.email)
      }
    }
    fetchSettings()
  }, [supabase])

  const steps = [
    {
      icon: <IconMapPin size={32} />,
      title: 'Kunjungi Lembaga Kami',
      description: 'Datang langsung ke lokasi RTQ kami selama jam kerja (13.30 - 16.30)',
    },
    {
      icon: <IconInfoCircle size={32} />,
      title: 'Konsultasi & Tes Kemampuan',
      description:
        'Ustadzah akan menjelaskan program, melakukan tes baca, dan menentukan jilid yang sesuai.',
    },
    {
      icon: <IconClock size={32} />,
      title: 'Mulai Membaca Jilid',
      description:
        'Ikuti jadwal yang telah ditentukan dan mulai pembelajaran dengan jilid yang ditetapkan.',
    },
  ]

  const infoItems = [
    {
      icon: <IconInfoCircle size={24} />,
      title: 'Penjelasan Program',
      description:
        "Santri belajar membaca Al-Qur'an dengan sistem kartu prestasi dan evaluasi (tashih) berkala.",
    },
    {
      icon: <IconBuildingStore size={24} />,
      title: 'Fasilitas Pembelajaran',
      description:
        'Tersedia 2 lantai dengan 5 ruang belajar, toilet, kantin, dan kipas angin di setiap ruangan.',
    },
    {
      icon: <IconUsers size={24} />,
      title: 'Ustadzah Berpengalaman',
      description: "Dibimbing oleh pengajar yang sabar dan kompeten dalam metode Yanbu'a.",
    },
    {
      icon: <IconClock size={24} />,
      title: 'Jadwal Belajar',
      description:
        "Sabtu-Kamis. Jam I (13.30-14.45) jilid 0-3, Jam II (15.00-16.25) jilid 4-7 & Al-Qur'an.",
    },
    {
      icon: <IconClipboardCheck size={24} />,
      title: 'Program Imtihan',
      description: 'Evaluasi resmi dari Yayasan LMY sebagai syarat kelulusan dan wisuda.',
    },
    {
      icon: <IconSchool size={24} />,
      title: 'Wisuda',
      description: 'Acara resmi perayaan kelulusan setelah menyelesaikan seluruh jenjang program.',
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 space-y-6 text-center lg:text-left"
          >
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-sm font-medium bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-full"
            >
              Yanbu'a Islami
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Informasi <br />
              <span className="text-green-600">Pendaftaran</span> <br />
              RTQ Al-Hikmah
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
              Bimbingan membaca Al-Qur'an untuk anak usia dini dengan metode Yanbu'a yang teruji dan
              berkualitas.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex justify-center"
          >
            <div className="relative w-full max-w-[500px] aspect-square">
              <Image
                src="/images/hero-3.svg"
                alt="RTQ Al-Hikmah Illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-3xl">
        <h2 className="text-3xl font-bold text-center mb-12 text-green-600">Proses Pendaftaran</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-none shadow-md hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-8 text-center md:text-left">
                  <div className="text-green-600 mb-6 flex justify-center md:justify-start">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="bg-green-600 rounded-[2rem] p-8 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Butuh Bantuan?</h2>
            <p className="text-green-50 mb-10 text-lg opacity-90">
              Tim kami siap menjawab pertanyaan Ayah/Bunda mengenai program pendidikan.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full gap-2 px-8 h-12 shadow-lg"
              >
                <a href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : '#'} target="_blank">
                  <IconBrandWhatsapp size={20} />
                  WhatsApp
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full gap-2 px-8 h-12 bg-transparent text-white border-white hover:bg-white hover:text-green-600 transition-colors"
              >
                <a href={email ? `mailto:${email}` : '#'}>
                  <IconMail size={20} />
                  Email
                </a>
              </Button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24 max-w-4xl">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Informasi Tambahan</h3>
          <p className="text-muted-foreground">
            Detail mendalam mengenai kurikulum, fasilitas, dan kegiatan santri.
          </p>
        </div>

        <Accordion type="single" collapsible defaultValue="item-0" className="w-full space-y-4">
          {infoItems.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border rounded-2xl px-4 bg-card shadow-sm data-[state=open]:border-green-500/50 data-[state=open]:ring-1 data-[state=open]:ring-green-500/20 transition-all overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline group py-5">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-2.5 rounded-xl bg-green-50 text-green-600 group-data-[state=open]:bg-green-600 group-data-[state=open]:text-white transition-colors">
                    {item.icon}
                  </div>
                  <span className="font-bold text-lg">{item.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-muted-foreground text-base leading-relaxed pl-14">
                {item.description}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  )
}

export default RegistrationPage
