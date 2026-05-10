'use client'

import Link from 'next/link'
import { IconDashboard, type Icon } from '@tabler/icons-react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const { setOpenMobile, openMobile } = useSidebar()

  const handleNavigation = () => {
    if (openMobile) setOpenMobile(false)
  }

  const dashboardItem = items.find((item) => item.url === '/protected')

  if (!dashboardItem) return null

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              asChild
              tooltip={dashboardItem.title}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <Link href={dashboardItem.url} onClick={handleNavigation}>
                <IconDashboard size={20} />
                <span>{dashboardItem.title}</span>
              </Link>
            </SidebarMenuButton>

            {/* Dekoratif — tanpa fungsi */}
            <div className="size-8 shrink-0 flex items-center justify-center rounded-md border border-sidebar-border bg-sidebar pointer-events-none select-none group-data-[collapsible=icon]:opacity-0">
              <IconDashboard size={16} className="text-primary" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
