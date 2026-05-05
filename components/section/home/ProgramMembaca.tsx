'use client'

import CardSliderJilid from '@/components/card/CardSliderJilid'

export default function ProgramMembaca() {
  return (
    <div className="container mx-auto overflow-hidden">
      <div className="px-4 mb-8 md:mb-10">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
          Kurikulum
        </p>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Program Membaca</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Kami menggunakan metode Yanbu&#39;a dalam Program Membaca di RTQ Al-Hikmah membimbing
          santri mulai dari mengenal huruf hijaiyah hingga bisa membaca Al-Qur&#39;an dengan lancar.
        </p>
      </div>

      <CardSliderJilid />
    </div>
  )
}
