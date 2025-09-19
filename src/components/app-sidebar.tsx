import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
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
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconFileDots,
  IconSearch,
  IconSettings,
  IconUsers,
  IconKey
} from "@tabler/icons-react"
import { NavMain } from "./nav-main"
import { NavDocuments } from "./nav-documents"

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
      url: "#",
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
              className=""
            >
              <a href="/console">
                <IconInnerShadowTop className="!size-6" />
                <span className="text-xl font-semibold">DCloud Infra</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
      </SidebarContent>
    </Sidebar>
  )
}
