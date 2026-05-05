'use client'

import ProgramMembaca from '@/components/section/home/ProgramMembaca'
import ProgramKami from '@/components/section/home/ProgramKami'
import KenaliKami from '@/components/section/home/KenaliKami'
import VisiMisi from '@/components/section/home/VisiMisi'
import Guru from '@/components/section/home/Guru'
import Berita from '@/components/section/home/Berita'
import Hero from '@/components/section/home/Hero'
import KelasUnggulan from '@/components/section/home/KelasUnggulan'

import { Separator } from '@/components/ui/separator'
import { motion } from 'motion/react'

const sectionVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Home() {
  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Hero />
      </section>

      <Separator className="mt-14 md:mt-20 opacity-40" />

      {/* Kelas Unggulan */}
      <motion.section
        className="py-14 md:py-20 overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <KelasUnggulan />
      </motion.section>

      <Separator className="opacity-40" />

      {/* Program Kami */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <ProgramKami />
      </motion.section>

      <Separator className="opacity-40" />

      {/* Program Membaca */}
      <motion.section
        id="program-section"
        className="py-14 md:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <ProgramMembaca />
      </motion.section>

      <Separator className="opacity-40" />

      {/* Kenali Kami */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <KenaliKami />
      </motion.section>

      <Separator className="opacity-40" />

      {/* Visi Misi */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <VisiMisi />
      </motion.section>

      <Separator className="opacity-40" />

      {/* Guru */}
      <motion.section
        className="py-14 md:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <Guru />
      </motion.section>

      <Separator className="opacity-40" />

      {/* Berita */}
      <motion.section
        className="pt-14 md:pt-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <Berita />
      </motion.section>
    </div>
  )
}
