"use client";
import Image from "next/image";

export default function Banner() {
  return (
    <div className="bg-green-500 text-white text-center p-2 flex justify-center">
      <Image
        src="/images/information.svg"
        alt="Info"
        className="mr-2"
        priority
        width={27}
        height={27}
      />
      Belajar Al-Qur&#39;an dengan Metode Yanbu&#39;a, Yuk Daftar Sekarang!!!
      <Image
        src="/images/information.svg"
        alt="Info"
        className="ml-2"
        priority
        width={27}
        height={27}
      />
    </div>
  );
}
