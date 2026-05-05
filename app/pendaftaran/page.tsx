'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import {
  IconMapPin,
  IconInfoCircle,
  IconClock,
  IconBuildingStore,
  IconUsers,
  IconClipboardCheck,
  IconSchool,
  IconArrowRight,
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
import { Separator } from '@/components/ui/separator'

const steps = [
  {
    number: '01',
    icon: <IconMapPin size={20} />,
    title: 'Kunjungi Lembaga',
    description: 'Datang langsung ke lokasi RTQ selama jam kerja, Sabtu–Kamis pukul 13.30–16.30.',
  },
  {
    number: '02',
    icon: <IconInfoCircle size={20} />,
    title: 'Konsultasi & Tes',
    description:
      "Ustadzah menjelaskan program, melakukan tes baca Al-Qur'an, dan menentukan jilid yang sesuai.",
  },
  {
    number: '03',
    icon: <IconClock size={20} />,
    title: 'Mulai Belajar',
    description:
      'Ikuti jadwal yang ditetapkan dan mulai pembelajaran sesuai jenjang yang telah ditentukan.',
  },
]

const infoItems = [
  {
    icon: <IconInfoCircle size={20} />,
    title: 'Penjelasan Program',
    description:
      "Santri belajar membaca Al-Qur'an dengan sistem kartu prestasi dan evaluasi (tashih) berkala.",
  },
  {
    icon: <IconBuildingStore size={20} />,
    title: 'Fasilitas Pembelajaran',
    description:
      'Tersedia 2 lantai dengan 5 ruang belajar, toilet, kantin, dan kipas angin di setiap ruangan.',
  },
  {
    icon: <IconUsers size={20} />,
    title: 'Ustadzah Berpengalaman',
    description: "Dibimbing oleh pengajar yang sabar dan kompeten dalam metode Yanbu'a.",
  },
  {
    icon: <IconClock size={20} />,
    title: 'Jadwal Belajar',
    description:
      "Sabtu–Kamis. Jam I (13.30–14.45) untuk jilid 0–3, Jam II (15.00–16.25) untuk jilid 4–7 & Al-Qur'an.",
  },
  {
    icon: <IconClipboardCheck size={20} />,
    title: 'Program Imtihan',
    description: 'Evaluasi resmi dari Yayasan LMY sebagai syarat kelulusan dan wisuda.',
  },
  {
    icon: <IconSchool size={20} />,
    title: 'Wisuda',
    description: 'Acara resmi perayaan kelulusan setelah menyelesaikan seluruh jenjang program.',
  },
]

export default function RegistrationPage() {
  const supabase = useMemo(() => createClient(), [])
  const [rtqName, setRtqName] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('pengaturan_website')
        .select('nama_rtq')
        .limit(1)
        .single()
      if (!error && data) setRtqName(data.nama_rtq)
    }
    fetchSettings()
  }, [supabase])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Hero ── */}
      <section className="container mx-auto px-4 py-14 md:py-24">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
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
              Yanbu&apos;a Islami
            </Badge>

            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
              Informasi Pendaftaran <span className="text-primary block mt-1">RTQ Al-Hikmah</span>
            </h1>

            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
              Bimbingan membaca Al-Qur&apos;an untuk anak usia dini dengan metode Yanbu&apos;a yang
              teruji, bersama ustadzah berpengalaman di lingkungan belajar yang kondusif.
            </p>

            {/* Single CTA — arahkan ke halaman Kontak, tidak duplikasi */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Button asChild size="sm" className="gap-2 rounded-full px-5">
                <Link href="/kontak">
                  Hubungi Kami
                  <IconArrowRight size={15} />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="gap-2 rounded-full px-5">
                <a href="#cara-mendaftar">Cara Mendaftar</a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="flex flex-1 justify-center lg:justify-end"
          >
            <div className="relative aspect-square w-full max-w-[340px] md:max-w-[460px]">
              <Image
                src="/images/hero-3.svg"
                alt="RTQ Al-Hikmah"
                fill
                priority
                className="object-contain"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <Separator className="opacity-40" />

      {/* ── Proses Pendaftaran ── */}
      <section id="cara-mendaftar" className="container mx-auto px-4 py-14 md:py-20">
        <div className="mb-10 md:mb-14">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            Cara Mendaftar
          </p>
          <h2 className="text-2xl font-bold md:text-3xl">Proses Pendaftaran</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
            Tiga langkah mudah untuk memulai perjalanan belajar Al-Qur&apos;an putra-putri Anda.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="group border border-border/60 shadow-none transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <CardContent className="p-5 md:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">{step.icon}</div>
                  <span className="text-3xl font-black text-muted-foreground/20 md:text-4xl">
                    {step.number}
                  </span>
                </div>
                <h3 className="mb-1.5 text-sm font-semibold md:text-base">{step.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA Banner — arahkan ke halaman Kontak ── */}
      <section className="container mx-auto px-4 pb-14 md:pb-20">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-10 md:px-12 md:py-14">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2 max-w-xl">
              <h2 className="text-xl font-bold text-primary-foreground md:text-3xl">
                Ada Pertanyaan?
              </h2>
              <p className="text-sm text-primary-foreground/85 md:text-base">
                Kunjungi halaman kontak kami untuk berkonsultasi langsung dengan ustadzah atau
                pengurus RTQ {rtqName || 'Al-Hikmah'}.
              </p>
            </div>

            <Button
              asChild
              size="sm"
              variant="secondary"
              className="gap-2 rounded-full px-6 shrink-0"
            >
              <Link href="/kontak">
                Ke Halaman Kontak
                <IconArrowRight size={15} />
              </Link>
            </Button>
          </div>

          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
        </div>
      </section>

      <Separator className="opacity-40" />

      {/* ── Informasi Tambahan ── */}
      <section className="container mx-auto max-w-3xl px-4 py-14 md:py-20">
        <div className="mb-10 md:mb-14">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            Detail Lengkap
          </p>
          <h2 className="text-2xl font-bold md:text-3xl">Informasi Tambahan</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
            Detail mendalam mengenai kurikulum, fasilitas, dan kegiatan santri.
          </p>
        </div>

        <Accordion type="single" collapsible defaultValue="item-0" className="space-y-3">
          {infoItems.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="overflow-hidden rounded-xl border border-border/60 bg-card px-4 shadow-none transition-all data-[state=open]:border-primary/40 data-[state=open]:ring-1 data-[state=open]:ring-primary/10"
            >
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 rounded-lg bg-primary/10 p-1.5 text-primary">
                    {item.icon}
                  </div>
                  <span className="text-left text-sm font-semibold md:text-base">{item.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pl-10 text-xs leading-relaxed text-muted-foreground md:pl-11 md:text-sm">
                {item.description}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  )
}
