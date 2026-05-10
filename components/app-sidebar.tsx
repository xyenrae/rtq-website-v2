'use client'

import * as React from 'react'
import {
  IconDashboard,
  IconNews,
  IconTags,
  IconPhoto,
  IconFolders,
  IconBell,
  IconSchool,
  IconUsers,
  IconChalkboard,
  IconUser,
  IconSettings,
  IconLogout,
  IconShieldHalfFilled,
  IconUserCircle,
} from '@tabler/icons-react'

import { NavMain } from '@/components/nav-main'
import { NavKonten } from '@/components/nav-konten'
import { NavAkademik } from '@/components/nav-akademik'
import { NavSistem } from '@/components/nav-sistem'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { NavUser } from './nav-user'

const data = {
  // Section 1 — hanya Dashboard (ditangani NavMain)
  navMain: [{ title: 'Dashboard', url: '/protected', icon: IconDashboard }],

  // Section 2 — Konten & Publikasi
  navKonten: [
    { title: 'Berita', url: '/protected/berita', icon: IconNews },
    { title: 'Kategori Berita', url: '/protected/berita/kategori', icon: IconTags },
    { title: 'Galeri', url: '/protected/galeri', icon: IconPhoto },
    { title: 'Kategori Galeri', url: '/protected/galeri/kategori', icon: IconFolders },
  ],

  // Section 3 — Akademik & Santri
  navAkademik: [
    { title: 'Monitoring Santri', url: '/protected/monitoring-santri', icon: IconSchool },
    { title: 'Hasil Rekomendasi', url: '/protected/hasil-rekomendasi', icon: IconUsers },
    { title: 'Aturan Capaian', url: '/protected/aturan-capaian', icon: IconChalkboard },
    { title: 'Data Guru', url: '/protected/guru', icon: IconUserCircle },
  ],

  // Section 4 — Sistem & Akun
  navSistem: [
    { title: 'Akun & Profil', url: '/protected/akun', icon: IconUser },
    { title: 'Pengaturan', url: '/protected/pengaturan', icon: IconSettings },
    { title: 'Keluar Akun', url: '#', icon: IconLogout, isLogout: true },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/protected">
                <IconShieldHalfFilled className="!size-6 text-primary" />
                <span className="text-lg font-bold tracking-tight">Hayolo hayolo</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard */}
        <NavMain items={data.navMain} />

        {/* Konten & Publikasi */}
        <NavKonten items={data.navKonten} />

        {/* Akademik & Santri */}
        <NavAkademik items={data.navAkademik} />

        {/* Sistem & Akun */}
        <div className="mt-auto">
          <NavSistem items={data.navSistem} />
        </div>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
