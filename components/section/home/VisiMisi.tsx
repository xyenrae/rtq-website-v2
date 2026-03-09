"use client";
import { motion } from 'motion/react'

const sectionVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function VisiMisi() {
  return (
    <motion.section
      className="relative w-screen h-fit py-24"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="bg-yellow-400 w-full absolute bottom-0 h-4 z-20"></div>
      <div className="bg-green-500 opacity-90 w-full h-full absolute inset-0 z-10"></div>
      <div className="absolute inset-0">
      </div>

      <div className="relative z-20 container flex flex-col sm:items-center">
        <div className="sm:text-lg text-white">
          <h2 className="text-2xl font-bold mb-6">Visi & Misi</h2>
          <p className="mt-2">
            Menciptakan generasi yang mencintai Al-Qur&#39;an dan menerapkan
            ajaran Islam dalam kehidupan sehari-hari.
          </p>
          <ul className="list-disc pl-5 mt-2 w-fit ml-4">
            <li>
              Menumbuhkan kecintaan terhadap Al-Qur&#39;an di kalangan santri
              sejak dini.
            </li>
            <li>
              Memberikan pendidikan agama Islam yang berkualitas dan menyeluruh.
            </li>
            <li>
              Mengembangkan pemahaman mendalam tentang nilai-nilai Al-Qur&#39;an
              untuk diaplikasikan dalam kehidupan nyata.
            </li>
          </ul>
        </div>
      </div>
    </motion.section>
  );
}
