'use client'

import ProgramMembaca from '@/components/section/home/ProgramMembaca'
import ProgramKami from '@/components/section/home/ProgramKami'
import KenaliKami from '@/components/section/home/KenaliKami'
import VisiMisi from '@/components/section/home/VisiMisi'
import Guru from '@/components/section/home/Guru'
import Berita from '@/components/section/home/Berita'
import Hero from '@/components/section/home/Hero'
import KelasUnggulan from '@/components/section/home/KelasUnggulan'

import { motion } from 'motion/react'

const sectionVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export default function Home() {
  return (
    <div className="w-full overflow-x-hidden">
      <div className="container mx-auto">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <Hero />
        </section>

        {/* Kelas Unggulan */}
        <motion.section
          className="mt-32 overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={sectionVariants}
        >
          <KelasUnggulan />
        </motion.section>

        {/* Program Kami */}
        <motion.section
          className="mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={sectionVariants}
        >
          <ProgramKami />
        </motion.section>

        {/* Program Membaca */}
        <motion.section
          id="program-section"
          className="mt-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={sectionVariants}
        >
          <ProgramMembaca />
        </motion.section>

        {/* Kenali Kami */}
        <motion.section
          className="mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={sectionVariants}
        >
          <KenaliKami />
        </motion.section>

        {/* Visi Misi */}
        <motion.section
          className="mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={sectionVariants}
        >
          <VisiMisi />
        </motion.section>

        {/* Guru */}
        <motion.section
          className="mt-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={sectionVariants}
        >
          <Guru />
        </motion.section>

        {/* Berita */}
        <motion.section
          className="mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={sectionVariants}
        >
          <Berita />
        </motion.section>
      </div>
    </div>
  )
}
