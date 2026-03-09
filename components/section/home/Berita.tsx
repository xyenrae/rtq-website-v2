"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBerita } from "@/hooks/santri/berita/useBerita";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
  }).format(date);
};

export default function Berita() {
  const [isMobile, setIsMobile] = useState(false);
  const { berita, isLoading } = useBerita("");

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  if (isLoading) return <SkeletonLoader />;

  return (
    <div className="container mx-auto px-4 pb-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-bold text-gray-800 text-start">
          Berita Terbaru
        </h1>
        <p className="mt-4 text-gray-600 text-start">
          Kami menyediakan berita terkini tentang program belajar, kegiatan
          sehari-hari, pengumuman penting, dan pencapaian dari Santri RTQ
          Al-Hikmah.
        </p>
      </div>
      {/* Berita Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {berita.slice(0, isMobile ? 3 : 6).map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden flex flex-col sm:flex-row"
          >
            <Link href={`/berita/${item.id}`} className="flex flex-1">
              {/* Gambar */}
              <div className="relative w-4/12 sm:w-1/3 h-32 sm:h-auto">
                <Image
                  src={item.gambar || "/placeholder.jpg"}
                  alt={item.judul}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              {/* Konten */}
              <div className="p-2 sm:p-4 flex flex-col justify-between flex-1">
                <div>
                  {/* Kategori */}
                  {item.kategori && (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium mb-1">
                      {item.kategori.nama}
                    </span>
                  )}
                  {/* Judul dengan line-clamp */}
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                    {item.judul}
                  </h3>
                </div>
                {/* Tanggal */}
                <div className="flex justify-end">
                  <p className="text-sm text-gray-500">
                    {formatDate(item.created_at)}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      {/* Button Lihat Semua */}
      <div className="mt-8">
        <Link
          href="/berita"
          className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
        >
          Lihat Semua Berita
        </Link>
      </div>
    </div>
  );
}

// Skeleton Loader tanpa Framer Motion
const SkeletonLoader = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="animate-pulse text-center mb-12">
        <div className="h-10 w-64 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div className="h-6 w-96 bg-gray-300 rounded-full mx-auto"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {[...Array(isMobile ? 3 : 6)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col sm:flex-row"
          >
            <div className="relative w-4/12 sm:w-1/3 h-32 sm:h-auto bg-gray-300"></div>
            <div className="p-2 sm:p-4 flex flex-col justify-between flex-1 space-y-4">
              <div className="h-4 w-24 bg-gray-300 rounded-full"></div>
              <div className="h-6 w-48 bg-gray-300 rounded-full"></div>
              <div className="h-4 w-32 bg-gray-300 rounded-full self-end"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
