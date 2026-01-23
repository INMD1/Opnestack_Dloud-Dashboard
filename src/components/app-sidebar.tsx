import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconBellExclamation,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconFileDots,
  IconSearch,
  IconSettings,
  IconKey
} from "@tabler/icons-react"
import { NavMain } from "./nav-main"
import { NavDocuments } from "./nav-documents"
import { ThemeToggle } from "./ThemeToggle"

const data = {

  navMain: [
    {
      title: "인터페이스",
      url: "/console/instance/view",
      icon: IconDashboard,
    },
    {
      title: "네트워크",
      url: "/console/network/view",
      icon: IconListDetails,
    },
    {
      title: "디스크",
      url: "/console/disk/view",
      icon: IconChartBar,
    },
    {
      title: "키페어",
      url: "/console/keypair",
      icon: IconKey,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "서버 현황",
      url: "#",
      icon: IconFileDots,
    },
    {
      name: "도움말",
      url: "https://docs.dcloud.p-e.kr/",
      icon: IconFileDots,
    },
    {
      name: "공지사항",
      url: "#",
      icon: IconBellExclamation,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:bg-sidebar-accent transition-all duration-00 group mt-4 mb-2" 
            >
              <a href="/console" className="flex items-center gap-3">
                <div className="gradient-primary p-2 rounded-lg">
                  <IconInnerShadowTop className="!size-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">DCloud Infra</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-muted-foreground">테마</span>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
