"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  const handleScroll = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="container mx-auto px-4 pt-16">
      <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
        {/* Text Section */}
        <div className="flex-1 order-2 lg:order-1 relative z-10">
          <div className="max-w-2xl mx-auto lg:mx-0 sm:text-center lg:text-left">
            <div className="mb-6">
              <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                Yanbu&#39;a Islami
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Membentuk Santri Cinta
              <span className="relative whitespace-nowrap text-green-600">
                <span className="relative z-10"> Al-Qur&#39;an </span>
              </span>
              Sejak Dini
            </h1>
            <p className="sm:text-lg text-gray-600 mb-8">
              Bersama kami, santri akan belajar membaca, menghafal, dan
              mengamalkan ajaran Al-Qur&#39;an dalam kehidupan sehari-hari.
            </p>
            <div className="flex flex-row gap-4 justify-start">
              <Link href={`/pendaftaran`}>
                <button className="text-sm sm:text-md bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 shadow-sm hover:shadow-green-200">
                  Daftar Sekarang
                </button>
              </Link>
              <button
                onClick={() => handleScroll("program-section")}
                className="text-sm sm:text-md border-2 border-green-600 text-green-700 hover:bg-green-50 px-8 py-4 rounded-full shadow-sm font-semibold transition-all hover:shadow-green-200 hover:scale-105"
              >
                Info Program
              </button>
            </div>
          </div>
        </div>
        {/* Image Section */}
        <div className="flex-1 order-1 lg:order-2 flex justify-center items-center">
          <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] ml-auto">
            <Image
              src="/images/hero-1.svg"
              alt="Hero Image"
              width={500}
              height={500}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
