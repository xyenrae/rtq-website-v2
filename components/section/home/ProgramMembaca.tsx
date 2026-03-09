"use client";

import CardSliderJilid from "@/components/card/CardSliderJilid";

export default function PrgramMembaca() {
  return (
    <div className="container overflow-hidden">
      <div className="sm:text-center mb-12">
        <h2 className="text-2xl font-bold mb-4">Program Membaca</h2>
        <p className="text-gray-600 max-w-2xl sm:mx-auto">
          Kami menggunakan metode Yanbu&#39;a dalam Program Membaca di RTQ
          Al-Hikmah membimbing santri mulai dari mengenal huruf hijaiyah hingga
          bisa membaca Al-Qur&#39;an dengan lancar.
        </p>
      </div>

      <CardSliderJilid />
    </div>
  );
}
