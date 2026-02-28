'use client'

import * as React from 'react'
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
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
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/protected',
      icon: IconDashboard,
    },
    {
      title: 'Lifecycle',
      url: '/protected/lifecycle',
      icon: IconListDetails,
    },
    {
      title: 'Analytics',
      url: '/protected/analytics',
      icon: IconChartBar,
    },
    {
      title: 'Projects',
      url: '/protected/projects',
      icon: IconFolder,
    },
    {
      title: 'Team',
      url: '/protected/team',
      icon: IconUsers,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/protected/settings',
      icon: IconSettings,
    },
    {
      title: 'Get Help',
      url: '/protected/help',
      icon: IconHelp,
    },
    {
      title: 'Search',
      url: '/protected/search',
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: 'Data Library',
      url: '/protected/datalibrary',
      icon: IconDatabase,
    },
    {
      name: 'Reports',
      url: '/protected/reports',
      icon: IconReport,
    },
    {
      name: 'Word Assistant',
      url: '/protected/wordassistant',
      icon: IconFileWord,
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
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
