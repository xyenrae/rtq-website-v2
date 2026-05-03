'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

export default function Banner() {
  return (
    <div className="border-b bg-primary text-primary-foreground">
      <div className="container mx-auto flex min-h-11 items-center justify-center px-4 py-2">
        <div className="flex items-center gap-2 text-center text-xs font-normal sm:text-sm lg:text-base">
          <Image
            src="/images/information.svg"
            alt="Informasi"
            width={20}
            height={20}
            priority
            className="size-4 shrink-0 sm:size-5"
          />

          <p className="leading-normal">
            Belajar Al-Qur&apos;an dengan Metode Yanbu&apos;a{' '}
            <Badge
              variant="secondary"
              className="mx-1 rounded-full px-2 py-0 text-[10px] font-medium sm:px-2.5 sm:text-xs"
            >
              Yuk Daftar Sekarang
            </Badge>
          </p>

          <Image
            src="/images/information.svg"
            alt="Informasi"
            width={20}
            height={20}
            priority
            className="size-4 shrink-0 sm:size-5"
          />
        </div>
      </div>
    </div>
  )
}
