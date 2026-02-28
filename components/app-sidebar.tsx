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
  IconBuildingCommunity,
  IconReportMoney,
  IconReportAnalytics,
  IconSettings,
  IconShieldHalfFilled,
} from '@tabler/icons-react'

import { NavDocuments } from '@/components/nav-documents'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
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
    {
      title: 'Dashboard',
      url: '/protected',
      icon: IconDashboard,
    },
    {
      title: 'Berita',
      url: '/protected/berita',
      icon: IconNews,
    },
    {
      title: 'Kategori Berita',
      url: '/protected/berita/kategori',
      icon: IconTags,
    },
    {
      title: 'Galeri',
      url: '/protected/galeri',
      icon: IconPhoto,
    },
    {
      title: 'Kategori Galeri',
      url: '/protected/galeri/kategori',
      icon: IconFolders,
    },
    {
      title: 'Pengumuman',
      url: '/protected/pengumuman',
      icon: IconBell,
    },
    {
      title: 'Agenda Kegiatan',
      url: '/protected/agenda',
      icon: IconCalendarEvent,
    },
  ],
  // Menggunakan array 'documents' bawaan template untuk data Master
  documents: [
    {
      name: 'Data Guru',
      url: '/protected/guru',
      icon: IconSchool,
    },
    {
      name: 'Data Santri',
      url: '/protected/santri',
      icon: IconUsers,
    },
    {
      name: 'Data Kelas',
      url: '/protected/kelas',
      icon: IconChalkboard,
    },
  ],
  navSecondary: [
    {
      title: 'Keuangan & SPP',
      url: '/protected/keuangan',
      icon: IconReportMoney,
    },
    {
      title: 'Laporan',
      url: '/protected/laporan',
      icon: IconReportAnalytics,
    },
    {
      title: 'Pengaturan',
      url: '/protected/pengaturan',
      icon: IconSettings,
    },
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
                {/* Ikon Logo Aplikasi */}
                <IconShieldHalfFilled className="!size-6 text-primary" />
                <span className="text-lg font-bold tracking-tight">Sistem Ponpes</span>
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

        {/* Menu Sistem & Laporan */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
