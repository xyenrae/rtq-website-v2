"use client";
import CardSliderGuru from "@/components/card/CardSliderGuru";

export default function Guru() {
  return (
    <div className="container overflow-hidden">
      <div className="sm:text-center mb-12">
        <h2 className="text-2xl font-bold mb-4">Ustadz dan Ustadzah Kami</h2>
        <p className="text-gray-600 max-w-2xl sm:mx-auto">
          Ustadz dan ustadzah di TPQ Al-Hikmah selalu berusaha agar santri
          merasa nyaman belajar. Mereka mengajarkan Al-Qur’an dengan cara yang
          mudah dipahami dan menyenangkan.
        </p>
      </div>

      <CardSliderGuru />
    </div>
  );
}
