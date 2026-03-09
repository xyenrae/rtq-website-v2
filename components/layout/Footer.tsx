'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandYoutube,
  IconMapPin,
  IconPhone,
  IconMail,
} from '@tabler/icons-react'
import { motion } from 'motion/react'
import { createClient } from '@/lib/supabase/client'

interface FooterLinkProps {
  href: string
  label: string
}

interface SocialIconProps {
  href: string
  children: React.ReactNode
  label: string
}

// Komponen Ikon Sosial dengan Motion
const SocialIcon: React.FC<SocialIconProps> = ({ href, children, label }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ y: -3, transition: { duration: 0.2 } }}
    className="text-gray-600 hover:text-green-600 transition-colors"
    aria-label={label}
  >
    {children}
  </motion.a>
)

// Komponen Link dengan Animasi Sliding Text
const FooterLink: React.FC<FooterLinkProps> = ({ href, label }) => {
  return (
    <Link href={href} className="relative overflow-hidden group block py-1">
      <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">
        {label}
      </span>
      <span className="absolute top-full left-0 transition-transform duration-300 group-hover:-translate-y-full text-green-500">
        {label}
      </span>
    </Link>
  )
}

export default function Footer() {
  const [isMounted, setIsMounted] = useState(false)
  const [settings, setSettings] = useState({
    nama_rtq: 'RTQ Al-Hikmah',
    logo_url: '/images/logo-rtq.png',
    email: '',
    no_whatsapp: '',
    alamat: '',
    facebook: '',
    instagram: '',
    youtube: '',
    deskripsi_singkat: '',
  })

  const supabase = createClient()

  useEffect(() => {
    setIsMounted(true)

    const fetchSettings = async () => {
      // Mengambil data dari tabel 'pengaturan_website' sesuai skema SQL
      const { data, error } = await supabase
        .from('pengaturan_website')
        .select(
          'nama_rtq, logo_url, email, no_whatsapp, alamat, facebook, instagram, youtube, deskripsi_singkat'
        )
        .single()

      if (!error && data) {
        setSettings(data)
      } else if (error) {
        console.error('Error fetching settings:', error.message)
      }
    }

    fetchSettings()
  }, [supabase])

  return (
    <footer className="pt-16 pb-8 border-t border-gray-100 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 lg:gap-16">
          {/* Bagian 1: Logo & Deskripsi */}
          <div className="flex flex-col items-start space-y-6">
            <Link href="/" className="group flex items-center gap-3">
              <Image
                src={settings.logo_url || '/images/logo-rtq.png'}
                alt={`Logo ${settings.nama_rtq}`}
                width={70}
                height={70}
                className="object-contain"
              />
              <div className="flex flex-col">
                <span className="font-bold text-2xl text-green-600 leading-tight">
                  {settings.nama_rtq.split(' ')[1] || settings.nama_rtq}
                </span>
                <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                  Cinta Al-Qur&apos;an, Cinta Ilmu
                </span>
              </div>
            </Link>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              {settings.deskripsi_singkat ||
                'Kami berkomitmen untuk memberikan kesempatan belajar yang sesuai dengan usia bagi setiap anak.'}
            </p>

            {/* Media Sosial */}
            <div className="flex gap-5 mt-4">
              {settings.facebook && (
                <SocialIcon href={settings.facebook} label="Facebook">
                  <IconBrandFacebook size={24} stroke={1.5} />
                </SocialIcon>
              )}
              {settings.instagram && (
                <SocialIcon href={settings.instagram} label="Instagram">
                  <IconBrandInstagram size={24} stroke={1.5} />
                </SocialIcon>
              )}
              {settings.youtube && (
                <SocialIcon href={settings.youtube} label="YouTube">
                  <IconBrandYoutube size={24} stroke={1.5} />
                </SocialIcon>
              )}
            </div>
          </div>

          {/* Bagian 2: Navigasi Cepat */}
          <div className="flex flex-col sm:items-center">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Navigasi Cepat</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 w-full max-w-xs text-sm md:text-base text-gray-600">
              <div className="space-y-1">
                <FooterLink href="/" label="Beranda" />
                <FooterLink href="/berita" label="Berita" />
                <FooterLink href="/pendaftaran" label="Pendaftaran" />
              </div>
              <div className="space-y-1">
                <FooterLink href="/galeri" label="Galeri" />
                <FooterLink href="/kontak" label="Kontak" />
                <FooterLink href="/login" label="Admin" />
              </div>
            </div>
          </div>

          {/* Bagian 3: Kontak */}
          <div className="flex flex-col sm:items-end">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Kontak Kami</h3>
            <div className="space-y-4 text-gray-600 text-sm md:text-base sm:text-right">
              <div className="flex items-start gap-3 sm:justify-end">
                <IconMapPin size={20} className="text-green-500 shrink-0 mt-0.5" />
                <span>{settings.alamat || 'Alamat belum diatur'}</span>
              </div>
              <div className="flex items-center gap-3 sm:justify-end">
                <IconPhone size={20} className="text-green-500 shrink-0" />
                <span>{settings.no_whatsapp || 'Nomor belum diatur'}</span>
              </div>
              <div className="flex items-center gap-3 sm:justify-end">
                <IconMail size={20} className="text-green-500 shrink-0" />
                <span className="break-all">{settings.email || 'Email belum diatur'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-200 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {isMounted ? new Date().getFullYear() : '2026'} {settings.nama_rtq}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
