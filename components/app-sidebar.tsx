'use client'

import * as React from 'react'
import {
  IconDashboard,
  IconNews,
  IconTags,
  IconPhoto,
  IconFolders,
  IconBell,
  IconCalendarEvent,
  IconSchool,
  IconUsers,
  IconChalkboard,
  IconUser,
  IconSettings,
  IconLogout,
  IconShieldHalfFilled,
} from '@tabler/icons-react'

import { NavDocuments } from '@/components/nav-documents'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary' // Import komponen baru
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const data = {
  user: {
    name: 'Admin Pondok',
    email: 'admin@pesantren.id',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    { title: 'Dashboard', url: '/protected', icon: IconDashboard },
    { title: 'Berita', url: '/protected/berita', icon: IconNews },
    { title: 'Kategori Berita', url: '/protected/berita/kategori', icon: IconTags },
    { title: 'Galeri', url: '/protected/galeri', icon: IconPhoto },
    { title: 'Kategori Galeri', url: '/protected/galeri/kategori', icon: IconFolders },
    { title: 'Pengumuman', url: '/protected/pengumuman', icon: IconBell },
    { title: 'Agenda Kegiatan', url: '/protected/agenda', icon: IconCalendarEvent },
  ],
  documents: [
    { name: 'Monitoring Santri', url: '/protected/monitoring-santri', icon: IconSchool },
    { name: 'Hasil Rekomendasi', url: '/protected/hasil-rekomendasi', icon: IconUsers },
    { name: 'Aturan Capaian', url: '/protected/aturan-capaian', icon: IconChalkboard },
  ],
  // Update: tambahkan isLogout: true untuk item logout
  navSecondary: [
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
              <a href="#">
                <IconShieldHalfFilled className="!size-6 text-primary" />
                <span className="text-lg font-bold tracking-tight">Hayolo hayolo</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Menu Operasional & Konten */}
        <NavMain items={data.navMain} />

        {/* Master Data Akademik */}
        <NavDocuments items={data.documents} />

        {/* Menu Sistem & Logout (Komponen Terpisah) */}
        <NavSecondary items={data.navSecondary} label="Settings" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
