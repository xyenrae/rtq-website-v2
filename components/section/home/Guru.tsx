'use client'

import CardSliderGuru from '@/components/card/CardSliderGuru'

export default function Guru() {
  return (
    <div className="container mx-auto overflow-hidden">
      <div className="px-4 mb-8 md:mb-10">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
          Tim Pengajar
        </p>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Ustadz dan Ustadzah Kami</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Ustadz dan ustadzah di TPQ Al-Hikmah selalu berusaha agar santri merasa nyaman belajar.
          Mereka mengajarkan Al-Qur&#39;an dengan cara yang mudah dipahami dan menyenangkan.
        </p>
      </div>

      <CardSliderGuru />
    </div>
  )
}
